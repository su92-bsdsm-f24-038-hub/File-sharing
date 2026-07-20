import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const GUMROAD_PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, token } = await req.json();

    if (!licenseKey || !token) {
      return NextResponse.json({ success: false, error: "Missing license key or token." }, { status: 400 });
    }

    // Verify Firebase token to get uid
    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid session. Please log in again." }, { status: 401 });
    }

    // Verify license key with Gumroad
    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey.trim(),
        increment_uses_count: "false",
      }),
    });

    const gumroadData = await gumroadRes.json();

    if (!gumroadData.success) {
      return NextResponse.json(
        { success: false, error: "Invalid license key. Please check and try again." },
        { status: 400 }
      );
    }

    // Check the purchase wasn't refunded or chargebacked
    const purchase = gumroadData.purchase;
    if (purchase?.refunded || purchase?.chargebacked) {
      return NextResponse.json(
        { success: false, error: "This license key is no longer valid (refunded)." },
        { status: 400 }
      );
    }

    // Set Firebase custom claim
    await adminAuth.setCustomUserClaims(uid, { plan: "pro" });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-license]", err);
    return NextResponse.json({ success: false, error: "Server error. Please try again." }, { status: 500 });
  }
}
