import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold">900 Homes</span>
            <p className="text-sm text-muted-foreground">
              Life stories from Raintree Village, Katy TX.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link
              href="/stories"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Stories
            </Link>
            <Link
              href="/submit"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Submit
            </Link>
            <Link
              href="/admin/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Admin
            </Link>
          </nav>
        </div>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} 900 Homes. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
