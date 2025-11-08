
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import type { AttendanceRecord } from '@/lib/types';

// This function now returns a boolean indicating success or failure.
function initializeFirebaseAdmin(): boolean {
    if (admin.apps.length > 0) {
        return true; // Already initialized
    }
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        // Check if essential environment variables are present.
        if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
            console.error('Firebase Admin credentials are not set in the environment variables.');
            return false;
        }
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
        return true;
    } catch (error: any) {
        console.error('Firebase Admin initialization error:', error.message);
        return false;
    }
}

const attendanceCollectionId = 'attendance';
const attendanceDocId = 'records';

export async function GET() {
  if (!initializeFirebaseAdmin()) {
    return NextResponse.json({ error: 'Firebase Admin not configured. Check server environment variables.' }, { status: 500 });
  }
  
  try {
    const db = admin.firestore();
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json(docSnap.data() || {});
    } else {
      return NextResponse.json({});
    }
  } catch (error: any) {
    console.error("Error fetching attendance from Firestore:", error.message);
    return NextResponse.json({ error: 'Failed to fetch attendance data', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!initializeFirebaseAdmin()) {
    return NextResponse.json({ error: 'Firebase Admin not configured. Check server environment variables.' }, { status: 500 });
  }

  try {
    const records: AttendanceRecord = await request.json();
    const db = admin.firestore();
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    
    await docRef.set(records, { merge: true }); 
    
    return NextResponse.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (error: any)    {
    console.error("Error saving attendance to Firestore:", error.message);
    return NextResponse.json({ error: 'Failed to save attendance data', details: error.message }, { status: 500 });
  }
}
