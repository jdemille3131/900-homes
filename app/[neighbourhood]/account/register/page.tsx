"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Shield, ArrowLeft } from "lucide-react";
import { AvatarUploader } from "@/components/avatar-uploader";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { useNeighbourhood } from "@/components/neighbourhood-context";

type Step = 1 | 2 | "done";

export default function RegisterPage() {
  const { neighbourhood, href } = useNeighbourhood();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  async function handleStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("display_name") as string;

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, neighbourhood_id: neighbourhood.id },
        emailRedirectTo: `${window.location.origin}${href("/account/confirm")}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSentEmail(email);
    setUserId(data.user?.id || null);
    setStep(2);
    setLoading(false);
  }

  async function handleStep2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await updateProfile({
      display_name: formData.get("display_name") as string || sentEmail,
      bio: formData.get("bio") as string,
      move_in_year: (formData.get("move_in_year") as string) || "",
      street_address: formData.get("street_address") as string,
      phone: formData.get("phone") as string,
      avatar_url: avatarUrl,
      city: formData.get("city") as string,
      county: formData.get("county") as string,
      state: formData.get("state") as string,
    });

    if (result.error) {
      toast.error("Please check the form for errors.");
      setLoading(false);
      return;
    }

    setStep("done");
    setLoading(false);
  }

  // Step 3: Check your email
  if (step === "done") {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full nh-bg-light">
                <Mail className="h-10 w-10 nh-text" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="mt-2">
              We&apos;ve sent a confirmation link to{" "}
              <strong className="text-foreground">{sentEmail}</strong>.
              Click the link in the email to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t get it? Check your spam folder.
            </p>
            <Link
              href={href("/account/login")}
              className="inline-block text-sm nh-text hover:underline font-medium"
            >
              Back to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Profile info
  if (step === 2) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="nh-text font-medium">Step 2 of 2</span>
              <span>— Tell us about yourself</span>
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Help your neighbors get to know you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep2} className="space-y-6">
              {/* Avatar */}
              {userId && (
                <div className="flex justify-center">
                  <AvatarUploader
                    userId={userId}
                    currentUrl={avatarUrl}
                    onUploaded={setAvatarUrl}
                  />
                </div>
              )}

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="A few words about yourself — how long you've lived here, what you love about the neighborhood, hobbies..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">Up to 500 characters</p>
              </div>

              {/* Move-in year */}
              <div className="space-y-2">
                <Label htmlFor="move_in_year">Year You Moved to {neighbourhood.name}</Label>
                <Input
                  id="move_in_year"
                  name="move_in_year"
                  type="number"
                  min={1950}
                  max={new Date().getFullYear()}
                  placeholder="e.g. 2005"
                />
              </div>

              {/* City / County / State */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={neighbourhood.city || ""}
                    placeholder="e.g. Katy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    name="county"
                    defaultValue={neighbourhood.county || ""}
                    placeholder="e.g. Harris"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={neighbourhood.state || ""}
                    placeholder="e.g. TX"
                  />
                </div>
              </div>

              <Separator />

              {/* Private info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full nh-bg-light mt-0.5">
                    <Shield className="h-5 w-5 nh-text" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Private Information</h3>
                    <p className="text-sm text-muted-foreground">
                      This information is <strong>never shared publicly</strong>. We only
                      use it to verify you&apos;re a {neighbourhood.name} resident and to
                      contact you about your stories if needed.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border nh-border-light nh-bg-light/50 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street_address">Street Address</Label>
                    <Input
                      id="street_address"
                      name="street_address"
                      placeholder={`Your ${neighbourhood.name} address`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for verification only — never displayed or shared.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 555-5555"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional — only used if we need to reach you about a story.
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full nh-bg nh-bg-hover" disabled={loading}>
                {loading ? "Saving..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: Account creation
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="nh-text font-medium">Step 1 of 2</span>
            <span>— Create your account</span>
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Sign up to submit stories and track their approval status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStep1} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                placeholder="How you'd like to be known"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Continue"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <Link href="login" className="nh-text hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
