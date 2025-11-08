import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error("Firebase Admin credentials are not set in the environment variables.");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    // Log the detailed initialization error to the server console.
    console.error("🔥 Firebase Admin Initialization Error:", error);
    // We don't re-throw here, so the app can start, but subsequent DB calls will fail.
    // The GET/POST handlers will catch and log the subsequent errors.
  }
}

export const db = admin.firestore();
