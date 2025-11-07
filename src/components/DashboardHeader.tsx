"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import type { CollegeDetails } from "@/lib/types";

export function DashboardHeader() {
  const router = useRouter();
  const [collegeDetails, setCollegeDetails] = useState<CollegeDetails | null>(null);

  useEffect(() => {
    const storedDetails = localStorage.getItem("collegeDetails");
    if (storedDetails) {
      setCollegeDetails(JSON.parse(storedDetails));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Logo className="h-6 w-6 mr-2" />
          <span className="font-bold hidden sm:inline-block">Class Attendance</span>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="hidden md:flex flex-col items-end text-sm">
            <p className="font-semibold">{collegeDetails?.collegeName}</p>
            <p className="text-muted-foreground">{collegeDetails?.className}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
