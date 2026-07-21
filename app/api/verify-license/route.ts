import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

const GUMROAD_PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID!;

function abortSignal(ms: number) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

/** Decode JWT payload without verifying signature — uid extraction only. */
function decodeJwtUid(token: string): string {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Malformed token");
  const json = Buffer.from(payload, "base64url").toString("utf8");
  const { sub } = JSON.parse(json);
  if (!sub) throw new Error("No uid in token");
  return sub;
}

export async function POST(req: NextRequest) {
  console.log("[verify-license] POST received");

  let licenseKey: string, token: string;
  try {
    const body = await req.json();
    licenseKey = body.licenseKey;
    token = body.token;
    console.log("[verify-license] licenseKey:", licenseKey?.slice(0, 8), "token length:", token?.length);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  if (!licenseKey || !token) {
    return NextResponse.json({ success: false, error: "Missing license key or token." }, { status: 400 });
  }

  // Step 1: Extract uid from token (no network call needed)
  let uid: string;
  try {
    uid = decodeJwtUid(token);
    console.log("[verify-license] uid:", uid);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: `Bad token: ${e?.message}` }, { status: 401 });
  }

  // Step 2: Init Firebase Admin (needed only for setCustomUserClaims)
  let adminAuth: ReturnType<typeof getAdminAuth>;
  try {
    adminAuth = getAdminAuth();
  } catch (e: any) {
    console.error("[verify-license] admin init error:", e?.message);
    return NextResponse.json({ success: false, error: `Admin init failed: ${e?.message}` }, { status: 500 });
  }

  // Step 3: Verify with Gumroad
  console.log("[verify-license] calling gumroad with product_permalink:", GUMROAD_PRODUCT_ID);
  let gumroadData: any;
  try {
    const params = new URLSearchParams({
      product_permalink: GUMROAD_PRODUCT_ID,
      license_key: licenseKey.trim(),
      increment_uses_count: "false",
    });

    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: params.toString(),
      cache: "no-store",
      signal: abortSignal(15000),
    });

    const text = await gumroadRes.text();
    console.log("[verify-license] gumroad raw response:", text.slice(0, 300));
    gumroadData = JSON.parse(text);
  } catch (e: any) {
    console.error("[verify-license] gumroad error:", e?.message);
    return NextResponse.json(
      { success: false, error: `Could not reach Gumroad: ${e?.message}` },
      { status: 500 }
    );
  }

  if (!gumroadData.success) {
    console.log("[verify-license] gumroad rejected:", gumroadData.message);
    return NextResponse.json(
      { success: false, error: gumroadData.message ?? "Invalid license key." },
      { status: 400 }
    );
  }

  const purchase = gumroadData.purchase;
  if (purchase?.refunded || purchase?.chargebacked) {
    return NextResponse.json(
      { success: false, error: "This license key is no longer valid (refunded)." },
      { status: 400 }
    );
  }

  // Step 4: Grant Pro
  try {
    await adminAuth.setCustomUserClaims(uid, { plan: "pro" });
    console.log("[verify-license] Pro granted to", uid);
  } catch (e: any) {
    console.error("[verify-license] setCustomUserClaims error:", e?.message);
    return NextResponse.json({ success: false, error: `Failed to grant Pro: ${e?.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
