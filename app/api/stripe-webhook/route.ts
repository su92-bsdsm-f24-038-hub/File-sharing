import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminAuth } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        
        if (uid) {
          await adminAuth.setCustomUserClaims(uid, { plan: "pro" });
          console.log(`Upgraded user ${uid} to pro.`);
        }
        break;
      }
      
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        // The customer ID can be mapped back if we saved it to Firebase, 
        // but for simplicity without DB, we rely on the client_reference_id 
        // during checkout to set it initially. To handle deletions properly 
        // without a DB mapping customer->UID, we might need a Firebase Function 
        // or we store the customer ID in custom claims during checkout completion.
        
        // As a robust "no-DB" solution, let's update claims if subscription ends.
        // Wait, we need the UID. Let's assume we store customer_id in claims too 
        // if we were fully implementing billing portal sync. 
        // For the scope of this project and lack of DB, if a sub is deleted, 
        // we might not have the UID directly on the subscription object unless 
        // we add it to metadata during checkout.
        
        const customerId = subscription.customer as string;
        // In a real app with no DB, you'd fetch the user by email or a custom claim 
        // that holds the stripeCustomerId, or put the UID in subscription.metadata.
        // We will check metadata.uid.
        const uid = subscription.metadata.uid;
        if (uid && subscription.status === "canceled") {
           await adminAuth.setCustomUserClaims(uid, { plan: "free" });
           console.log(`Downgraded user ${uid} to free.`);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
