
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import type { AttendanceRecord } from '@/lib/types';

// This is the key fix: Initialize Firebase Admin SDK only if it hasn't been initialized already.
// This prevents errors during development with hot-reloading.
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set.');
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
    // This will cause GET/POST requests to fail, which is intended if setup is wrong.
  }
}

const db = admin.firestore();
const attendanceCollectionId = 'attendance';
const attendanceDocId = 'records';

export async function GET() {
  // Ensure the app was initialized before proceeding
  if (!admin.apps.length) {
    console.error("Firebase Admin has not been initialized. Check your environment variables.");
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }
  
  try {
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json(docSnap.data() || {});
    } else {
      // If no document exists, return an empty object. This is a valid, expected state.
      return NextResponse.json({});
    }
  } catch (error: any) {
    console.error("Error fetching attendance from Firestore:", error.message);
    return NextResponse.json({ error: 'Failed to fetch attendance data', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    // Ensure the app was initialized before proceeding
  if (!admin.apps.length) {
    console.error("Firebase Admin has not been initialized. Check your environment variables.");
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    const records: AttendanceRecord = await request.json();
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    
    // Using set with merge: true will create the document if it doesn't exist,
    // and update/merge the fields if it does. This is the correct way to update partial data.
    await docRef.set(records, { merge: true }); 
    
    return NextResponse.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (error: any)    {
    console.error("Error saving attendance to Firestore:", error.message);
    return NextResponse.json({ error: 'Failed to save attendance data', details: error.message }, { status: 500 });
  }
}
