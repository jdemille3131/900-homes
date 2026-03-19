"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StoryBody } from "@/components/story-body";
import { updateStoryFields } from "@/app/actions/stories";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";

interface StoryEditorProps {
  storyId: string;
  initialTitle: string;
  initialContributorName: string;
  initialBody: string;
}

export function StoryEditor({
  storyId,
  initialTitle,
  initialContributorName,
  initialBody,
}: StoryEditorProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [contributorName, setContributorName] = useState(initialContributorName);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateStoryFields(storyId, {
      title,
      contributor_name: contributorName,
      body,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Story updated.");
      setEditing(false);
    }
    setSaving(false);
  }

  function handleCancel() {
    setTitle(initialTitle);
    setContributorName(initialContributorName);
    setBody(initialBody);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">by {contributorName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <StoryBody body={body} />
      </div>
    );
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Editing Story</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Contributor Name</Label>
        <Input value={contributorName} onChange={(e) => setContributorName(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Story Body</Label>
        <p className="text-xs text-muted-foreground">
          Use **Question?** on its own line followed by the answer on the next line for Q&A formatting.
        </p>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={20}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}
