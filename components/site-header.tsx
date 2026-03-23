"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, BookOpen, UserCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Neighbourhood } from "@/types/database";

interface SiteHeaderProps {
  neighbourhood?: Neighbourhood;
}

export function SiteHeader({ neighbourhood }: SiteHeaderProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const prefix = neighbourhood ? `/${neighbourhood.slug}` : "";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLinks = neighbourhood
    ? [
        { href: `${prefix}`, label: "Home" },
        { href: `${prefix}/stories`, label: "Stories" },
        ...(neighbourhood.discover_enabled ? [{ href: `${prefix}/discover`, label: "Discover" }] : []),
        { href: `${prefix}/submit`, label: "Share Your Story" },
        { href: `${prefix}/faq`, label: "FAQ" },
      ]
    : [
        { href: "/", label: "Home" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={prefix || "/"} className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">900 Homes</span>
          {neighbourhood && (
            <span className="hidden sm:inline text-sm text-muted-foreground font-normal">
              — {neighbourhood.name}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full nh-bg-100 nh-text font-medium text-sm nh-bg-hover transition-colors"
                aria-label="Account menu"
              >
                <User className="h-4 w-4" />
              </button>
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-background shadow-lg z-50">
                    <div className="p-2 border-b">
                      <p className="text-xs text-muted-foreground truncate px-2">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        href={`${prefix}/account/profile`}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserCircle className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link
                        href={`${prefix}/account/stories`}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        My Stories
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors w-full text-left text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href={`${prefix}/account/login`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={`${prefix}/account/register`}
                className="inline-flex items-center justify-center h-8 px-4 rounded-lg nh-bg text-white font-medium text-sm nh-bg-hover transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={`${prefix}/account/profile`}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href={`${prefix}/account/stories`}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  My Stories
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="text-sm font-medium text-destructive text-left py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`${prefix}/account/login`}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href={`${prefix}/account/register`}
                  className="text-sm font-medium nh-text py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
