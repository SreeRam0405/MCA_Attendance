
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AttendanceRecord } from '@/lib/types';

const docRef = doc(db, 'attendance', 'records');

export async function GET() {
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    } else {
      // If no document exists, return an empty object
      return NextResponse.json({});
    }
  } catch (error) {
    console.error("Error fetching attendance: ", error);
    return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const records: AttendanceRecord = await request.json();
    await setDoc(docRef, records);
    return NextResponse.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (error) {
    console.error("Error saving attendance: ", error);
    return NextResponse.json({ error: 'Failed to save attendance data' }, { status: 500 });
  }
}
