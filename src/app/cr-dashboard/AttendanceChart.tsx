"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import type { AttendanceRecord, Student } from "@/lib/types";
import { subjects } from "@/lib/data";

interface AttendanceChartProps {
  attendanceData: AttendanceRecord;
  students: Student[];
}

export default function AttendanceChart({ attendanceData, students }: AttendanceChartProps) {
  const totalClassesPerSubject: Record<string, number> = {};
  
  for (const date in attendanceData) {
    for (const subject in attendanceData[date]) {
      if (subjects.includes(subject)) {
        totalClassesPerSubject[subject] = (totalClassesPerSubject[subject] || 0) + 1;
      }
    }
  }

  const totalClasses = Object.values(totalClassesPerSubject).reduce((acc, count) => acc + count, 0);

  const chartData = students.map(student => {
    let attendedDays = 0;
    for (const date in attendanceData) {
        for (const subject in attendanceData[date]) {
            if (attendanceData[date][subject].includes(student.rollNo)) {
                attendedDays++;
            }
        }
    }
    const percentage = totalClasses > 0 ? (attendedDays / totalClasses) * 100 : 0;
    return {
      name: student.name,
      percentage: Math.round(percentage),
    };
  });

  if(totalClasses === 0) {
    return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No attendance data available to show chart.
        </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
            contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))'
            }}
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.5 }}
        />
        <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
