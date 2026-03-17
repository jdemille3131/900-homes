"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { updateUserRole, updateUserDisplayName, deleteUser } from "@/app/actions/users";
import { toast } from "sonner";
import { Pencil, Shield, ShieldOff, Trash2 } from "lucide-react";
import type { Profile } from "@/types/database";

interface UserActionsProps {
  profile: Profile;
  isSelf: boolean;
}

export function UserActions({ profile, isSelf }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name || "");

  async function handleToggleRole() {
    if (isSelf) {
      toast.error("You cannot change your own role.");
      return;
    }

    const newRole = profile.role === "admin" ? "user" : "admin";
    const confirmed = confirm(
      `Are you sure you want to ${newRole === "admin" ? "promote" : "demote"} ${profile.email} to ${newRole}?`
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await updateUserRole(profile.id, newRole);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`User ${newRole === "admin" ? "promoted to admin" : "demoted to user"}.`);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete() {
    const confirmed = confirm(
      `Are you sure you want to permanently delete ${profile.email}? This cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await deleteUser(profile.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("User deleted.");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleUpdateName() {
    setLoading(true);
    const result = await updateUserDisplayName(profile.id, displayName);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Display name updated.");
      setEditOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger
          className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {profile.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleUpdateName}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleRole}
        disabled={loading || isSelf}
        title={
          isSelf
            ? "Cannot change own role"
            : profile.role === "admin"
            ? "Remove admin"
            : "Make admin"
        }
      >
        {profile.role === "admin" ? (
          <ShieldOff className="h-4 w-4" />
        ) : (
          <Shield className="h-4 w-4" />
        )}
      </Button>

      {!isSelf && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
          title="Delete user"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
