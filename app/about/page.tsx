import Link from "next/link";
import { ArrowLeft, Home, BookOpen, Users, Heart, Star, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { createServiceClient } from "@/utils/supabase/server";
import type { PageSection } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Why 900 Homes?",
  description: "The story behind the storytelling project — why we believe every neighbourhood deserves to have its stories preserved.",
};

const iconMap: Record<string, LucideIcon> = {
  Home,
  BookOpen,
  Users,
  Heart,
  Star,
  MessageCircle,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  red: { bg: "bg-red-100", text: "text-red-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-700" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
};

function renderBody(body: string) {
  const paragraphs = body.split("\n\n").filter(Boolean);
  return paragraphs.map((p, i) => (
    <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
  ));
}

function ContentSection({
  section,
  alternate,
}: {
  section: PageSection;
  alternate: boolean;
}) {
  const Icon = section.icon ? iconMap[section.icon] : null;
  const colors = section.icon_color ? colorMap[section.icon_color] : null;

  return (
    <section className={`py-16 ${alternate ? "bg-muted/30" : ""}`}>
      <div className="container mx-auto px-4 max-w-3xl">
        {Icon && colors ? (
          <>
            <div className="flex items-start gap-4 mb-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.bg} shrink-0`}>
                <Icon className={`h-6 w-6 ${colors.text}`} />
              </div>
              <h2 className="text-2xl font-bold pt-2">{section.heading}</h2>
            </div>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed pl-16">
              {renderBody(section.body)}
            </div>
          </>
        ) : (
          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-bold text-foreground">{section.heading}</h2>
            {renderBody(section.body)}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function AboutPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page", "about")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const sections = (data as PageSection[]) || [];

  const hero = sections.find((s) => s.section_key === "hero");
  const cta = sections.find((s) => s.section_key === "cta");
  const bodySections = sections.filter(
    (s) => s.section_key !== "hero" && s.section_key !== "cta"
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">900 Homes</Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {hero?.heading || "Why 900 Homes?"}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              {hero?.body || "Because the most extraordinary stories are hiding in the most ordinary places."}
            </p>
          </div>
        </section>

        {/* Dynamic body sections */}
        {bodySections.map((section, i) => (
          <ContentSection
            key={section.id}
            section={section}
            alternate={i % 2 === 0}
          />
        ))}

        {/* CTA */}
        <section className="py-16 bg-muted/30 text-center">
          <div className="container mx-auto px-4 max-w-xl">
            <h2 className="text-2xl font-bold mb-4">
              {cta?.heading || "Ready to share yours?"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {cta?.body || "Find your neighbourhood and add your story to the archive."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
            >
              Find Your Neighbourhood
            </Link>
            <div className="mt-4">
              <a
                href="mailto:jason@900homes.org"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Questions? Email us
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} 900 Homes. All rights reserved.</span>
          <a href="mailto:jason@900homes.org" className="hover:text-foreground transition-colors">
            jason@900homes.org
          </a>
        </div>
      </footer>
    </div>
  );
}
