import * as admin from "firebase-admin";

function getAdminAuth() {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      throw new Error(
        "Missing Firebase Admin credentials. Set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local"
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }
  return admin.auth();
}

export { getAdminAuth };
// Keep named export for any existing usages
export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    return (getAdminAuth() as any)[prop];
  },
});
