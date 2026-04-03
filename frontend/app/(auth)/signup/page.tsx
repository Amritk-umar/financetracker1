"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError("");

    try {
      // 1. Attempt the signup
      await signIn("password", { email, password, flow: "signUp" });

      // 2. SUCCESS: Redirect to dashboard
      router.push("/dashboard");

    } catch (err) {
      // Log the exact error so you can see what the backend actually said
      console.error("Signup Error Details:", err);

      const message = err instanceof Error ? err.message : String(err);
      const lowerCaseMessage = message.toLowerCase();

      // 3. THE FIX: Catch multiple variations of the "Already Exists" error
      if (
        lowerCaseMessage.includes("already exists") ||
        lowerCaseMessage.includes("taken") ||
        lowerCaseMessage.includes("in use") ||
        lowerCaseMessage.includes("duplicate")
      ) {
        // Show the alert
        alert("This account is already registered! Redirecting to Login...");

        // Redirect after 1.5 seconds so they have time to read the alert
        setTimeout(() => {
          router.push("/login"); // ⚠️ Change this if your login page is "/auth" or something else
        }, 1500);

      } else {
        // If it's a different error (like "Password too short"), show it on the UI
        setError("Something went wrong: " + message);
      }
    } finally {
      setPending(false);
    }

    useEffect(() => {
      const wakeUpBackend = async () => {
        try {
          const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
          // We just ping the backend root URL. We don't care about the response.
          await fetch(`${BACKEND_URL}/`);
          console.log("Backend wake-up ping sent!");
        } catch (error) {
          console.log("Waking up backend...");
        }
      };

      wakeUpBackend();
    }, []); // Empty array means this runs EXACTLY once when the page opens
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader><CardTitle>Create Account</CardTitle></CardHeader>
        <CardContent>
          {/* --- 1. Display the error message if it exists --- */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSignUp} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline font-medium">
              Log In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}