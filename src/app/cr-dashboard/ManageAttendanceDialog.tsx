
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
import { useToast } from "@/hooks/use-toast";

interface ManageAttendanceDialogProps {
  records: AttendanceRecord;
  onRecordsUpdate: (records: AttendanceRecord) => void;
}

export function ManageAttendanceDialog({ records, onRecordsUpdate }: ManageAttendanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [editedRecords, setEditedRecords] = useState(records);
  const { toast } = useToast();

  // When the dialog opens, sync the state
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEditedRecords(JSON.parse(JSON.stringify(records))); // Deep copy
    }
    setOpen(isOpen);
  };

  const handleAttendanceChange = (
    date: string,
    subject: string,
    rollNo: string,
    present: boolean
  ) => {
    const newRecords = { ...editedRecords };
    if (!newRecords[date]) newRecords[date] = {};
    if (!newRecords[date][subject]) newRecords[date][subject] = [];

    const studentList = newRecords[date][subject];
    const studentIndex = studentList.indexOf(rollNo);

    if (present && studentIndex === -1) {
      studentList.push(rollNo);
    } else if (!present && studentIndex !== -1) {
      studentList.splice(studentIndex, 1);
    }
    setEditedRecords(newRecords);
  };
  
  const handleSave = async () => {
     try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedRecords),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }
      
      onRecordsUpdate(editedRecords); // Update parent state
      toast({
        title: "Success",
        description: "Attendance records updated successfully.",
      });
      setOpen(false);

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not save attendance records.",
        variant: "destructive",
      });
    }
  };

  const sortedDates = Object.keys(records).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              <h3 className="font-bold text-lg mb-2">{format(new Date(date.replace(/-/g, '/')), "PPP")}</h3>
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
                                    checked={editedRecords[date]?.[subject]?.includes(student.rollNo)}
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
