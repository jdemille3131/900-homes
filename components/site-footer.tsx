import Link from "next/link";
import type { Neighbourhood } from "@/types/database";

interface SiteFooterProps {
  neighbourhood?: Neighbourhood;
}

export function SiteFooter({ neighbourhood }: SiteFooterProps) {
  const prefix = neighbourhood ? `/${neighbourhood.slug}` : "";

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold">900 Homes</span>
            <p className="text-sm text-muted-foreground">
              {neighbourhood
                ? `Life stories from ${neighbourhood.name}.`
                : "Collecting neighbourhood life stories."}
            </p>
          </div>
          <nav className="flex gap-6">
            {neighbourhood ? (
              <>
                <Link
                  href={`${prefix}/stories`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Stories
                </Link>
                <Link
                  href={`${prefix}/submit`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Submit
                </Link>
              </>
            ) : null}
            <a
              href="mailto:jason@900homes.org"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </a>
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
