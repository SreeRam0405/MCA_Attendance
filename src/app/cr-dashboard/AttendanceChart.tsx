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

interface AttendanceChartProps {
  attendanceData: AttendanceRecord;
  students: Student[];
}

export default function AttendanceChart({ attendanceData, students }: AttendanceChartProps) {
  const totalDays = Object.keys(attendanceData).length;

  const chartData = students.map(student => {
    let attendedDays = 0;
    for (const date in attendanceData) {
      if (attendanceData[date].includes(student.rollNo)) {
        attendedDays++;
      }
    }
    const percentage = totalDays > 0 ? (attendedDays / totalDays) * 100 : 0;
    return {
      name: student.name,
      percentage: Math.round(percentage),
    };
  });

  if(totalDays === 0) {
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
