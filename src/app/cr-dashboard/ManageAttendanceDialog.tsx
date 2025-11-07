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
import { users } from "@/lib/data";
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
        <Button variant="outline" className="w-full sm:w-auto">Manage Attendance</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Attendance</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-4">
          {sortedDates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No attendance records found.</p>
          ) : sortedDates.map((date) => (
            <div key={date} className="mb-4">
              <h3 className="font-bold text-lg mb-2">{format(new Date(date), "PPP")}</h3>
              {Object.keys(records[date]).map((subject) => (
                <div key={subject} className="mb-4">
                    <h4 className="font-semibold text-md mb-1">{subject}</h4>
                    <div className="overflow-x-auto">
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
                                <TableCell className="whitespace-nowrap">{student.rollNo}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell className="text-right">
                                    <Checkbox
                                    checked={records[date]?.[subject]?.includes(student.rollNo)}
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
  );
}
