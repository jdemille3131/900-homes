import Link from "next/link";
import { LayoutDashboard, ListChecks, Users, MessageCircleQuestion, HelpCircle, LogOut, MapPin, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-4 hidden md:block">
        <h2 className="text-lg font-bold mb-6 px-2">Admin Panel</h2>
        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/stories"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <ListChecks className="h-4 w-4" />
            Moderation Queue
          </Link>
          <Link
            href="/admin/questions"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <MessageCircleQuestion className="h-4 w-4" />
            Story Prompts
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
          <Link
            href="/admin/neighbourhoods"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Neighbourhoods
          </Link>
          <Link
            href="/admin/about-page"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <FileText className="h-4 w-4" />
            About Page
          </Link>
          <Link
            href="/admin/faqs"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            FAQs
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors mt-8"
          >
            <LogOut className="h-4 w-4" />
            Back to Site
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
