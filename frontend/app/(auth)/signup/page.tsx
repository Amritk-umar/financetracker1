"use client";

import { useState } from "react";
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
    setError(""); // Clear previous errors

    try {
      await signIn("password", { email, password, flow: "signUp" });
      // If successful, the middleware/Convex usually handles the redirect
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "";

      // Check if the error is "User already exists"
      if (message.includes("already exists") || message.includes("taken")) {
        alert("Account already exists! Redirecting you to Login In...");

        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setPending(false);
    }
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