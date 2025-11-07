# **App Name**: ClassAttendant

## Core Features:

- Setup Page: Allows inputting college name, class name, and class strength; stores the data to localStorage and redirects to the login page.
- Role-Based Login: Distinguishes between CR and student logins, using hardcoded credentials. Redirects to appropriate dashboards after validation.
- CR Dashboard: Displays student list, attendance marking (checkboxes), and saves attendance to localStorage. Shows total present and the attendance date.
- Attendance Chart: Presents a bar chart visualization of student attendance percentages using Chart.js, updated dynamically as attendance is marked.
- Student Dashboard: Displays student-specific attendance data (classes attended, total classes, attendance percentage) fetched from localStorage.
- Motivational Prompts: Show a motivational message to students depending on whether they're at 75% attendance or not.
- Data Persistence: Utilizes localStorage to maintain data even after refresh, ensuring continuous access to college details, attendance records, and student data.

## Style Guidelines:

- Primary color: Soft blue (#A0C4FF) for a calm and educational atmosphere.
- Background color: Very light blue (#EBF2FA), nearly white, to maintain a clean aesthetic.
- Accent color: Lavender (#BDB2FF) to draw attention to interactive elements.
- Body and headline font: 'PT Sans' (sans-serif) for a modern yet approachable feel, suitable for both headlines and body text.
- Simple, clear icons for attendance status and navigation; consistent across the site.
- Centered layout for forms; responsive table design for student lists, scrollable on mobile.
- Smooth transitions for navigation, loading states, and updates to attendance data.