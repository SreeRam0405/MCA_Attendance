
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { users, subjects } from "@/lib/data";
import type { AttendanceRecord, LoggedInUser } from "@/lib/types";
import { DashboardHeader } from "@/components/DashboardHeader";
import AttendanceChart from "./AttendanceChart";
import { ManageAttendanceDialog } from "./ManageAttendanceDialog";
import { ExportAttendance } from "./ExportAttendance";

export default function CRDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord>({});

  useEffect(() => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
      router.replace("/login");
      return;
    }
    const user: LoggedInUser = JSON.parse(userString);
    if (user.role !== "CR") {
      router.replace("/login");
      return;
    }

    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/attendance');
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          let errorData = { details: 'Failed to parse error response.' };
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {}
          console.error("API Error:", errorData.details);
          throw new Error('Failed to fetch attendance');
        }
        const records: AttendanceRecord = await response.json();
        setAllAttendanceRecords(records);
      } catch (error) {
        console.error("Failed to fetch attendance records:", error);
        toast({
          title: "Error",
          description: "Could not load attendance data. Please check your connection or Firebase setup.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [router, toast]);

  const handleAttendanceChange = (rollNo: string, isPresent: boolean) => {
    setAttendance((prev) => ({ ...prev, [rollNo]: isPresent }));
  };

  useEffect(() => {
    // Prevent running this effect until data is loaded
    if (loading) return;

    const formattedDate = format(date, "yyyy-MM-dd");
    const todaysRecord = allAttendanceRecords[formattedDate]?.[selectedSubject] || [];
    const initialAttendance = users.students.reduce((acc, student) => {
      acc[student.rollNo] = todaysRecord.includes(student.rollNo);
      return acc;
    }, {} as Record<string, boolean>);
    setAttendance(initialAttendance);
  }, [date, selectedSubject, allAttendanceRecords, loading]);

  const saveAttendance = async () => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const presentStudents = Object.keys(attendance).filter((rollNo) => attendance[rollNo]);
    
    const updatedRecords: AttendanceRecord = { 
        ...allAttendanceRecords, 
        [formattedDate]: {
            ...(allAttendanceRecords[formattedDate] || {}),
            [selectedSubject]: presentStudents 
        }
    };
    
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecords),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      setAllAttendanceRecords(updatedRecords);
      toast({
        title: "Attendance Saved ✅",
        description: `Attendance for ${selectedSubject} on ${format(date, "PPP")} has been successfully saved.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not save attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Dashboard...</div>
      </div>
    );
  }

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalStudents = users.students.length;

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">CR Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => setDate(d || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                    {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              <Button onClick={saveAttendance} className="w-full">Save Attendance</Button>
              <ManageAttendanceDialog 
                records={allAttendanceRecords} 
                onRecordsUpdate={setAllAttendanceRecords} 
              />
               <ExportAttendance records={allAttendanceRecords} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present ({selectedSubject})</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentCount}</div>
              <p className="text-xs text-muted-foreground">
                on {format(date, "PPP")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="w-[100px]">Roll No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Attendance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.students.map((student) => (
                                <TableRow key={student.rollNo}>
                                    <TableCell className="font-medium">{student.rollNo}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <label htmlFor={`att-${student.rollNo}`} className="text-sm">Present</label>
                                        <Checkbox
                                        id={`att-${student.rollNo}`}
                                        checked={attendance[student.rollNo] || false}
                                        onCheckedChange={(checked) =>
                                            handleAttendanceChange(student.rollNo, !!checked)
                                        }
                                        />
                                    </div>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Attendance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AttendanceChart attendanceData={allAttendanceRecords} students={users.students} />
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </>
  );
}
