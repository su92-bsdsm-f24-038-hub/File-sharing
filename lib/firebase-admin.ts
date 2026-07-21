import * as admin from "firebase-admin";

function initAdmin() {
  if (admin.apps.length) return admin.app();

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set");
  if (!process.env.FIREBASE_CLIENT_EMAIL) throw new Error("FIREBASE_CLIENT_EMAIL is not set");

  // Next.js strips outer quotes but keeps literal \n — normalize both cases
  const normalizedKey = privateKey
    .replace(/^"/, "").replace(/"$/, "")  // strip any remaining outer quotes
    .replace(/\\n/g, "\n");              // literal \n → actual newline

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizedKey,
    }),
  });
}

export function getAdminAuth() {
  initAdmin();
  return admin.auth();
}
