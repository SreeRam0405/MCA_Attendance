"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { users, subjects } from "@/lib/data";
import type { AttendanceRecord } from "@/lib/types";
import { format } from "date-fns";

interface ManageAttendanceDialogProps {
  records: AttendanceRecord;
  setRecords: (records: AttendanceRecord) => void;
}

export function ManageAttendanceDialog({ records, setRecords }: ManageAttendanceDialogProps) {
  const [open, setOpen] = useState(false);

  const handleAttendanceChange = (
    date: string,
    subject: string,
    rollNo: string,
    present: boolean
  ) => {
    const newRecords = { ...records };
    if (!newRecords[date]) newRecords[date] = {};
    if (!newRecords[date][subject]) newRecords[date][subject] = [];

    const studentList = newRecords[date][subject];
    const studentIndex = studentList.indexOf(rollNo);

    if (present && studentIndex === -1) {
      studentList.push(rollNo);
    } else if (!present && studentIndex !== -1) {
      studentList.splice(studentIndex, 1);
    }
    setRecords(newRecords);
  };
  
  const handleSave = () => {
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
    setOpen(false);
  }

  const sortedDates = Object.keys(records).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Attendance</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Attendance</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          {sortedDates.map((date) => (
            <div key={date} className="mb-4">
              <h3 className="font-bold text-lg mb-2">{format(new Date(date), "PPP")}</h3>
              {Object.keys(records[date]).map((subject) => (
                <div key={subject} className="mb-4">
                    <h4 className="font-semibold text-md mb-1">{subject}</h4>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Present</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {users.students.map((student) => (
                            <TableRow key={student.rollNo}>
                            <TableCell>{student.rollNo}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-right">
                                <Checkbox
                                checked={records[date][subject]?.includes(student.rollNo)}
                                onCheckedChange={(checked) =>
                                    handleAttendanceChange(date, subject, student.rollNo, !!checked)
                                }
                                />
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              ))}
            </div>
          ))}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </change>
  <change>
    <file>src/app/cr-dashboard/ExportAttendance.tsx</file>
    <content><![CDATA["use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { users, subjects } from "@/lib/data";
import type { AttendanceRecord } from "@/lib/types";

interface ExportAttendanceProps {
  records: AttendanceRecord;
}

export function ExportAttendance({ records }: ExportAttendanceProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const downloadExcel = () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
        alert("Please select a date range.");
        return;
    }

    const from = dateRange.from;
    const to = dateRange.to;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Subject,Roll No,Name,Status\n";

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, "yyyy-MM-dd");
        if (records[dateStr]) {
            subjects.forEach(subject => {
                if (records[dateStr][subject]) {
                    users.students.forEach(student => {
                        const isPresent = records[dateStr][subject].includes(student.rollNo);
                        csvContent += `${dateStr},${subject},${student.rollNo},${student.name},${isPresent ? "Present" : "Absent"}\n`;
                    });
                } else {
                    users.students.forEach(student => {
                        csvContent += `${dateStr},${subject},${student.rollNo},${student.name},Absent\n`;
                    });
                }
            });
        }
    }


    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fromDate = format(dateRange.from, "yyyy-MM-dd");
    const toDate = format(dateRange.to, "yyyy-MM-dd");
    link.setAttribute("download", `attendance_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Export Attendance
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 flex flex-col gap-4">
        <p className="font-semibold">Select date range to export</p>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
        />
        <Button onClick={downloadExcel} disabled={!dateRange || !dateRange.from || !dateRange.to}>Download Excel</Button>
      </PopoverContent>
    </Popover>
  );
}
