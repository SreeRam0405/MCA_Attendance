"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logo } from "@/components/icons/logo";
import { users } from "@/lib/data";

const crSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

const studentSchema = z.object({
  rollNo: z.string().min(1, "Roll number is required."),
  password: z.string().min(1, "Password is required."),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const crForm = useForm<z.infer<typeof crSchema>>({
    resolver: zodResolver(crSchema),
    defaultValues: { username: "", password: "" },
  });

  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: { rollNo: "", password: "" },
  });

  const handleCrLogin = (values: z.infer<typeof crSchema>) => {
    if (
      values.username === users.CR.username &&
      values.password === users.CR.password
    ) {
      setError(null);
      localStorage.setItem("loggedInUser", JSON.stringify({ role: "CR" }));
      router.push("/cr-dashboard");
    } else {
      setError("Invalid CR username or password.");
    }
  };

  const handleStudentLogin = (values: z.infer<typeof studentSchema>) => {
    const student = users.students.find(
      (s) => s.rollNo === values.rollNo && s.password === values.password
    );
    if (student) {
      setError(null);
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({ role: "student", rollNo: student.rollNo, name: student.name })
      );
      router.push("/student-dashboard");
    } else {
      setError("Invalid student roll number or password.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            ClassAttendant
          </h1>
        </div>
        <Tabs defaultValue="cr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cr">CR Login</TabsTrigger>
            <TabsTrigger value="student">Student Login</TabsTrigger>
          </TabsList>
          <TabsContent value="cr">
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle>CR Login</CardTitle>
                <CardDescription>
                  Enter your credentials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...crForm}>
                  <form
                    onSubmit={crForm.handleSubmit(handleCrLogin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={crForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="cruser" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Login as CR</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Login</CardTitle>
                <CardDescription>
                  Enter your details to view your attendance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...studentForm}>
                  <form
                    onSubmit={studentForm.handleSubmit(handleStudentLogin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={studentForm.control}
                      name="rollNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roll Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 25001F0042" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={studentForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <Button type="submit" className="w-full">Login as Student</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </div>
    </main>
  );
}
