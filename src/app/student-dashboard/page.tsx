"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookCheck, CalendarDays, Percent, Smile, Frown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AttendanceRecord, LoggedInUser } from "@/lib/types";
import { DashboardHeader } from "@/components/DashboardHeader";
import { subjects } from "@/lib/data";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    attended: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
      router.replace("/login");
      return;
    }
    const parsedUser: LoggedInUser = JSON.parse(userString);
    if (parsedUser.role !== "student") {
      router.replace("/login");
      return;
    }
    setUser(parsedUser);

    const recordsString = localStorage.getItem("attendanceRecords");
    const records: AttendanceRecord = recordsString
      ? JSON.parse(recordsString)
      : {};

      const totalClassesPerSubject: Record<string, number> = {};
      for (const date in records) {
        for (const subject in records[date]) {
          if (subjects.includes(subject)) {
            totalClassesPerSubject[subject] = (totalClassesPerSubject[subject] || 0) + 1;
          }
        }
      }
      const totalClasses = Object.values(totalClassesPerSubject).reduce((acc, count) => acc + count, 0);

    let attendedClasses = 0;
    if (parsedUser.rollNo) {
      for (const date in records) {
        for (const subject in records[date]) {
            if (records[date][subject].includes(parsedUser.rollNo)) {
                attendedClasses++;
            }
        }
      }
    }

    setAttendanceStats({
      attended: attendedClasses,
      total: totalClasses,
      percentage:
        totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0,
    });

    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Dashboard...</div>
      </div>
    );
  }

  const attendancePercentage = Math.round(attendanceStats.percentage);
  const isAttendanceGood = attendancePercentage >= 75;
  const motivationalMessage = isAttendanceGood
    ? "Great! Keep it up! 💪"
    : "You need to improve your attendance 📚";

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground">Roll No: {user.rollNo}</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
              <BookCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.attended}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendancePercentage}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Your Attendance Progress</CardTitle>
                <CardDescription>
                    Here is a summary of your attendance. Minimum 75% is required.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={attendancePercentage} className="w-full" />
                <div className="flex items-center justify-center text-center p-4 rounded-lg bg-muted">
                    {isAttendanceGood ? (
                        <Smile className="h-6 w-6 mr-2 text-green-500" />
                    ) : (
                        <Frown className="h-6 w-6 mr-2 text-red-500" />
                    )}
                    <p className="text-lg font-medium">{motivationalMessage}</p>
                </div>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
