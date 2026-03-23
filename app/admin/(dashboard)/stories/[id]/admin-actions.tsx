"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { approveStory, rejectStory, deleteStory, toggleFeatureStory, toggleHideAudio } from "@/app/actions/stories";
import { toast } from "sonner";
import { CheckCircle, XCircle, Trash2, Star, EyeOff, Eye } from "lucide-react";

interface AdminActionsProps {
  storyId: string;
  currentStatus: string;
  isFeatured: boolean;
  isAudio?: boolean;
  hideAudio?: boolean;
}

export function AdminActions({ storyId, currentStatus, isFeatured: initialFeatured, isAudio, hideAudio: initialHideAudio }: AdminActionsProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [hideAudio, setHideAudio] = useState(initialHideAudio ?? false);

  async function handleApprove() {
    setLoading("approve");
    const result = await approveStory(storyId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Story approved!");
      router.refresh();
    }
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    const result = await rejectStory(storyId, notes);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Story rejected.");
      router.refresh();
    }
    setLoading(null);
  }

  async function handleToggleFeature() {
    setLoading("feature");
    const result = await toggleFeatureStory(storyId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setIsFeatured(!!result.featured);
      toast.success(result.featured ? "Story featured!" : "Story unfeatured.");
    }
    setLoading(null);
  }

  async function handleToggleHideAudio() {
    setLoading("hideAudio");
    const result = await toggleHideAudio(storyId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setHideAudio(!!result.hideAudio);
      toast.success(result.hideAudio ? "Audio hidden from public." : "Audio visible to public.");
    }
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to permanently delete this story and all its media?")) {
      return;
    }
    setLoading("delete");
    const result = await deleteStory(storyId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Story deleted.");
      router.push("/admin/stories");
    }
    setLoading(null);
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="font-semibold">Moderation Actions</h3>

      <div className="space-y-2">
        <Label htmlFor="admin_notes">Notes (optional, for rejection reason)</Label>
        <Textarea
          id="admin_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes..."
          rows={3}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {currentStatus !== "approved" && (
          <Button
            onClick={handleApprove}
            disabled={loading !== null}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading === "approve" ? "Approving..." : "Approve"}
          </Button>
        )}

        {currentStatus !== "rejected" && (
          <Button
            onClick={handleReject}
            disabled={loading !== null}
            variant="secondary"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {loading === "reject" ? "Rejecting..." : "Reject"}
          </Button>
        )}

        {currentStatus === "approved" && (
          <Button
            onClick={handleToggleFeature}
            disabled={loading !== null}
            variant={isFeatured ? "default" : "outline"}
            className={isFeatured ? "nh-bg nh-bg-hover" : ""}
          >
            <Star className={`h-4 w-4 mr-2 ${isFeatured ? "fill-current" : ""}`} />
            {loading === "feature"
              ? "Updating..."
              : isFeatured
                ? "Featured"
                : "Feature This Story"}
          </Button>
        )}

        {isAudio && (
          <Button
            onClick={handleToggleHideAudio}
            disabled={loading !== null}
            variant={hideAudio ? "default" : "outline"}
            className={hideAudio ? "bg-slate-600 hover:bg-slate-700" : ""}
          >
            {hideAudio ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {loading === "hideAudio"
              ? "Updating..."
              : hideAudio
                ? "Audio Hidden from Public"
                : "Hide Audio from Public"}
          </Button>
        )}
      </div>

      <Separator />

      <Button
        onClick={handleDelete}
        disabled={loading !== null}
        variant="destructive"
        size="sm"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {loading === "delete" ? "Deleting..." : "Delete Permanently"}
      </Button>
    </div>
  );
}
