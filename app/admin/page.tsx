import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: pendingCount } = await supabase
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: approvedCount } = await supabase
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: rejectedCount } = await supabase
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected");

  const totalCount = (pendingCount || 0) + (approvedCount || 0) + (rejectedCount || 0);

  const stats = [
    {
      label: "Pending Review",
      count: pendingCount || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Approved",
      count: approvedCount || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Rejected",
      count: rejectedCount || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Total Stories",
      count: totalCount,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(pendingCount || 0) > 0 && (
        <Link
          href="/admin/stories"
          className="inline-flex items-center gap-2 text-amber-700 hover:underline font-medium"
        >
          <Clock className="h-4 w-4" />
          Review {pendingCount} pending {pendingCount === 1 ? "story" : "stories"}
        </Link>
      )}
    </div>
  );
}
