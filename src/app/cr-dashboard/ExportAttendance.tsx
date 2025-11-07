"use client";

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
import { cn } from "@/lib/utils";

interface ExportAttendanceProps {
  records: AttendanceRecord;
}

export function ExportAttendance({ records }: ExportAttendanceProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const downloadCSV = () => {
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
        <Button variant="outline" className="w-full sm:w-auto">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Export Attendance
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 flex flex-col gap-4">
        <p className="font-semibold">Select date range to export</p>
        <div className={cn("grid gap-2")}>
            <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
            />
        </div>
        <Button onClick={downloadCSV} disabled={!dateRange || !dateRange.from || !dateRange.to}>Download CSV</Button>
      </PopoverContent>
    </Popover>
  );
}
