
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { BookCheck, CalendarDays, Percent, Smile, Frown, Calendar as CalendarIcon, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { AttendanceRecord, LoggedInUser } from "@/lib/types";
import { DashboardHeader } from "@/components/DashboardHeader";
import { subjects } from "@/lib/data";
import { cn } from "@/lib/utils";

interface DetailedAttendance {
    date: string;
    subject: string;
    status: "Present" | "Absent";
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [allRecords, setAllRecords] = useState<AttendanceRecord>({});
  
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [attendanceStats, setAttendanceStats] = useState({
    attended: 0,
    total: 0,
    percentage: 0,
  });
  const [detailedAttendance, setDetailedAttendance] = useState<DetailedAttendance[]>([]);


  useEffect(() => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
      router.replace("/login");
      return;
    }
    const parsedUser: LoggedInUser = JSON.parse(userString);
    if (parsedUser.role !== "student" || !parsedUser.rollNo) {
      router.replace("/login");
      return;
    }
    setUser(parsedUser);

    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/attendance');
        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 500 && errorData.error.includes("Firebase Admin not configured")) {
              setError("The application's backend is not configured. Please ensure your hosting environment has the correct Firebase Admin environment variables set.");
            } else {
              throw new Error(errorData.details || 'Failed to fetch attendance');
            }
        } else {
            const records: AttendanceRecord = await response.json();
            setAllRecords(records);
        }
      } catch (error: any) {
        console.error("Failed to fetch attendance records:", error);
        if(!error) {
            setError("Could not load attendance data. Please check your connection or Firebase setup.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [router]);

  useEffect(() => {
    if (loading || !user || !user.rollNo) return;

    let totalClasses = 0;
    let attendedClasses = 0;
    const detailedRecords: DetailedAttendance[] = [];

    const sortedDates = Object.keys(allRecords).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        // Adjust date to avoid timezone issues with comparison
        const checkDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);

        if (dateRange?.from && checkDate < dateRange.from) return;
        if (dateRange?.to && checkDate > dateRange.to) return;

        const dayRecords = allRecords[dateStr];
        
        subjects.forEach(subject => {
            const isSubjectFiltered = selectedSubject === 'all' || selectedSubject === subject;

            if(dayRecords[subject]){
                if(isSubjectFiltered) totalClasses++;
                
                const isPresent = dayRecords[subject].includes(user.rollNo!);
                if(isPresent && isSubjectFiltered) {
                    attendedClasses++;
                }

                if(isSubjectFiltered){
                    detailedRecords.push({
                        date: dateStr,
                        subject: subject,
                        status: isPresent ? "Present" : "Absent"
                    });
                }
            }
        });
    });

    setAttendanceStats({
      attended: attendedClasses,
      total: totalClasses,
      percentage: totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0,
    });
    setDetailedAttendance(detailedRecords);

  }, [user, allRecords, selectedSubject, dateRange, loading]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Alert variant="destructive" className="max-w-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Application Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    )
  }

  const attendancePercentage = Math.round(attendanceStats.percentage);
  const isAttendanceGood = attendancePercentage >= 75;
  const motivationalMessage = isAttendanceGood
    ? "Great! Keep it up! 💪"
    : "You need to improve your attendance. 📚";

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user.name}!</h1>
                <p className="text-muted-foreground text-sm md:text-base">Roll No: {user.rollNo}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map(subject => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full sm:w-[280px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                            <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                            </>
                            ) : (
                            format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                <Button variant="outline" onClick={() => setDateRange(undefined)} disabled={!dateRange} className="w-full sm:w-auto">Clear Filter</Button>
            </div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
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

        <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Your Attendance Progress</CardTitle>
                    <CardDescription>
                        Here is a summary of your attendance. A minimum of 75% is required.
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
                        <p className="text-md md:text-lg font-medium">{motivationalMessage}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[300px] overflow-y-auto">
                      <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detailedAttendance.length > 0 ? (
                                    detailedAttendance.map((record, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="whitespace-nowrap">{format(new Date(record.date.replace(/-/g, '/')), "PPP")}</TableCell>
                                            <TableCell>{record.subject}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", 
                                                    record.status === "Present" 
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                                )}>
                                                    {record.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            No records to display for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                      </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
