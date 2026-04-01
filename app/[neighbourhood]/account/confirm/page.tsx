"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNeighbourhood } from "@/components/neighbourhood-context";

export default function ConfirmPage() {
  const { href } = useNeighbourhood();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();

    // Supabase puts the auth tokens in the URL hash after email confirmation.
    // The client library automatically picks them up via onAuthStateChange.
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setStatus("success");
      }
    });

    // If the user lands here without a valid token, show an error after a timeout
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
      setErrorMsg("The confirmation link may have expired or already been used.");
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin nh-text mx-auto mb-4" />
          <p className="text-muted-foreground">Confirming your email...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
            <CardDescription>{errorMsg}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={href("/account/register")}
              className="inline-block text-sm nh-text hover:underline font-medium"
            >
              Try signing up again
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-green-50">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">You&apos;re All Set!</CardTitle>
          <CardDescription className="mt-2">
            Your account is confirmed and your profile is ready. Welcome to 900 Homes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            href={href("/submit")}
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg nh-bg text-white font-medium nh-bg-hover transition-colors"
          >
            Share Your First Story
          </Link>
          <div>
            <Link
              href={href("/")}
              className="inline-block text-sm nh-text hover:underline font-medium"
            >
              Explore your neighbourhood
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
