"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation"; // <-- 1. Import router
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter(); // <-- 2. Initialize router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      // "signIn" tells Convex this user already exists
      await signIn("password", { email, password, flow: "signIn" });
      // 3. Redirect the user upon success!
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed! Please check your credentials."); // <-- Added alert
    } finally {
      setPending(false);
    }
    // 1. Add this Wake-Up Ping
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
        <CardHeader><CardTitle>Login</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} // <-- Added TS type
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} // <-- Added TS type
              required
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}