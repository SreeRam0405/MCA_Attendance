
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import type { AttendanceRecord } from '@/lib/types';

// Use a function to initialize admin to avoid issues during build
function ensureFirebaseAdmin() {
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
          // Handle potential newline issues in environment variables
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error: any) {
      // This will be caught by the route handlers and returned as a 500 error.
      console.error("🔥 Firebase Admin Initialization Error in ensureFirebaseAdmin:", error.message);
      throw new Error(`Firebase Admin initialization failed: ${error.message}`);
    }
  }
  return admin.firestore();
}

const attendanceCollectionId = 'attendance';
const attendanceDocId = 'records';

export async function GET() {
  try {
    const db = ensureFirebaseAdmin();
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json(docSnap.data() || {});
    } else {
      // If the document doesn't exist, return an empty object, which is valid.
      return NextResponse.json({});
    }
  } catch (err: any) {
    console.error("🔥 [DEBUG] GET Attendance API Error:", err);
    const isConfigError = err.message.includes("Firebase Admin initialization failed");
    return NextResponse.json(
      { 
        message: isConfigError 
          ? "The application's backend is not configured. Please ensure your hosting environment has the correct Firebase Admin environment variables set."
          : "Failed to fetch attendance data.",
        error: err?.message || "Internal Server Error", 
        code: err?.code || null,
        stack: err?.stack || null 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = ensureFirebaseAdmin();
    const records: AttendanceRecord = await request.json();
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    
    // Use `set` without `merge` to completely overwrite the document.
    // This ensures that deletions are persisted correctly.
    await docRef.set(records); 
    
    return NextResponse.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (err: any) {
    console.error("🔥 [DEBUG] POST Attendance API Error:", err);
    const isConfigError = err.message.includes("Firebase Admin initialization failed");
    return NextResponse.json(
      { 
        message: isConfigError
          ? "The application's backend is not configured. Please ensure your hosting environment has the correct Firebase Admin environment variables set."
          : 'Failed to save attendance data.',
        error: err?.message || "Internal Server Error", 
        code: err?.code || null,
        stack: err?.stack || null 
      }, 
      { status: 500 }
    );
  }
}
