"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AvatarUploader } from "@/components/avatar-uploader";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import type { Profile } from "@/types/database";

interface ProfileFormProps {
  profile: Profile;
  userId: string;
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    const result = await updateProfile({
      display_name: formData.get("display_name") as string,
      bio: formData.get("bio") as string,
      move_in_year: (formData.get("move_in_year") as string) || "",
      street_address: formData.get("street_address") as string,
      phone: formData.get("phone") as string,
      avatar_url: avatarUrl,
    });

    if (result.error) {
      toast.error("Please check the form for errors.");
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar */}
      <div className="flex justify-center">
        <AvatarUploader
          userId={userId}
          currentUrl={avatarUrl}
          onUploaded={setAvatarUrl}
        />
      </div>

      <Separator />

      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">About You</h2>

        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name *</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={profile.display_name || ""}
            placeholder="How you'd like to be known"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio || ""}
            placeholder="A few words about yourself — how long you've lived here, what you love about the neighborhood, hobbies..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">Up to 500 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="move_in_year">Year You Moved to Raintree Village</Label>
          <Input
            id="move_in_year"
            name="move_in_year"
            type="number"
            min={1950}
            max={new Date().getFullYear()}
            defaultValue={profile.move_in_year || ""}
            placeholder="e.g. 2005"
          />
        </div>
      </div>

      <Separator />

      {/* Private Info */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-50 mt-0.5">
            <Shield className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Private Information</h2>
            <p className="text-sm text-muted-foreground">
              This information is <strong>never shared publicly</strong>. We only
              use it to verify you&apos;re a Raintree Village resident and to
              contact you about your stories if needed.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              name="street_address"
              defaultValue={profile.street_address || ""}
              placeholder="Your Raintree Village address"
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
              defaultValue={profile.phone || ""}
              placeholder="(555) 555-5555"
            />
            <p className="text-xs text-muted-foreground">
              Optional — only used if we need to reach you about a story.
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={saving}
        className="w-full bg-amber-700 hover:bg-amber-800"
      >
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
