"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting to login...</div>
    </div>
  );
}
