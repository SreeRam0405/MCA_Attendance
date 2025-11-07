
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AttendanceRecord } from '@/lib/types';

// Define a stable document reference.
const attendanceCollectionId = 'attendance';
const attendanceDocId = 'records';

export async function GET() {
  try {
    const docRef = doc(db, attendanceCollectionId, attendanceDocId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    } else {
      // If no document exists, return an empty object, which is a valid state.
      return NextResponse.json({});
    }
  } catch (error: any) {
    // Log the specific error to the server console for better debugging.
    console.error("Error fetching attendance from Firestore: ", error.message);
    return NextResponse.json({ error: 'Failed to fetch attendance data', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const records: AttendanceRecord = await request.json();
    const docRef = doc(db, attendanceCollectionId, attendanceDocId);
    await setDoc(docRef, records);
    return NextResponse.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (error: any) {
    console.error("Error saving attendance to Firestore: ", error.message);
    return NextResponse.json({ error: 'Failed to save attendance data', details: error.message }, { status: 500 });
  }
}
