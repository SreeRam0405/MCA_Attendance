
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import type { AttendanceRecord } from '@/lib/types';

// Initialize Firebase Admin SDK
// This needs service account credentials. Make sure the environment variables are set.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

const db = admin.firestore();
const attendanceCollectionId = 'attendance';
const attendanceDocId = 'records';

export async function GET() {
  try {
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json(docSnap.data());
    } else {
      // If no document exists, return an empty object, which is a valid state.
      return NextResponse.json({});
    }
  } catch (error: any) {
    console.error("Error fetching attendance from Firestore:", error.message);
    return NextResponse.json({ error: 'Failed to fetch attendance data', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const records: AttendanceRecord = await request.json();
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    await docRef.set(records, { merge: true }); // Use merge: true to avoid overwriting the whole document
    return NextResponse.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (error: any) {
    console.error("Error saving attendance to Firestore:", error.message);
    return NextResponse.json({ error: 'Failed to save attendance data', details: error.message }, { status: 500 });
  }
}
