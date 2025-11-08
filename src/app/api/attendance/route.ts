import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin'; // Using the new admin file
import type { AttendanceRecord } from '@/lib/types';

const attendanceCollectionId = 'attendance';
const attendanceDocId = 'records';

export async function GET() {
  try {
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json(docSnap.data() || {});
    } else {
      return NextResponse.json({});
    }
  } catch (err: any) {
    console.error("🔥 [DEBUG] GET Attendance API Error:", err);
    return NextResponse.json(
      { 
        message: "Failed to fetch attendance data.",
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
    const records: AttendanceRecord = await request.json();
    const docRef = db.collection(attendanceCollectionId).doc(attendanceDocId);
    
    await docRef.set(records, { merge: true }); 
    
    return NextResponse.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (err: any) {
    console.error("🔥 [DEBUG] POST Attendance API Error:", err);
    return NextResponse.json(
      { 
        message: 'Failed to save attendance data.',
        error: err?.message || "Internal Server Error", 
        code: err?.code || null,
        stack: err?.stack || null 
      }, 
      { status: 500 }
    );
  }
}
