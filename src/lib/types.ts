export interface CollegeDetails {
  collegeName: string;
  className: string;
  strength: number;
}

export interface Student {
  rollNo: string;
  name: string;
  password: string;
}

export interface CR {
  username: string;
  password: string;
}

export interface UserData {
  CR: CR;
  students: Student[];
}

export interface LoggedInUser {
    role: 'CR' | 'student';
    name?: string;
    rollNo?: string;
}

export type AttendanceRecord = Record<string, string[]>;
