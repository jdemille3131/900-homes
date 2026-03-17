import { createServiceClient } from "@/utils/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { UserActions } from "./user-actions";
import type { Profile } from "@/types/database";

export const metadata = {
  title: "Manage Users",
};

export default async function AdminUsersPage() {
  const supabase = createServiceClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Get story counts per user
  const { data: storyCounts } = await supabase
    .from("stories")
    .select("submitted_by, id")
    .not("submitted_by", "is", null);

  const countMap: Record<string, number> = {};
  for (const s of storyCounts || []) {
    if (s.submitted_by) {
      countMap[s.submitted_by] = (countMap[s.submitted_by] || 0) + 1;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <p className="text-muted-foreground mb-6">
        View and manage registered users. Promote users to admin or edit their details.
      </p>

      {profiles && profiles.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Stories</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(profiles as Profile[]).map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  {profile.display_name || "—"}
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={profile.role === "admin" ? "default" : "secondary"}
                  >
                    {profile.role}
                  </Badge>
                </TableCell>
                <TableCell>{countMap[profile.id] || 0}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(profile.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <UserActions
                    profile={profile}
                    isSelf={currentUser?.id === profile.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No registered users yet.
        </p>
      )}
    </div>
  );
}
