import Link from "next/link";
import { getAllNeighbourhoods } from "@/lib/neighbourhood";
import { MapPin, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const neighbourhoods = await getAllNeighbourhoods();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header */}
      <header className="border-b bg-background/95">
        <div className="container mx-auto flex h-16 items-center px-4">
          <span className="text-2xl font-bold tracking-tight">900 Homes</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 md:py-32 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Every neighbourhood has
              <br />
              <span className="text-muted-foreground">a story worth telling.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12">
              900 Homes is a community storytelling project dedicated to finding and
              preserving the life stories of the people who make our neighbourhoods
              what they are — before they go untold.
            </p>
          </div>
        </section>

        {/* Neighbourhoods */}
        {neighbourhoods.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">
                Our Communities
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {neighbourhoods.map((nh) => (
                  <Link
                    key={nh.id}
                    href={`/${nh.slug}`}
                    className="group block p-6 rounded-xl border bg-background hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                        style={{ backgroundColor: nh.accent_color + "20", color: nh.accent_color }}
                      >
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:underline">{nh.name}</h3>
                        {nh.home_count && (
                          <p className="text-sm text-muted-foreground">{nh.home_count} homes</p>
                        )}
                      </div>
                    </div>
                    {nh.tagline && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{nh.tagline}</p>
                    )}
                    <div className="flex items-center gap-1 mt-3 text-sm font-medium" style={{ color: nh.accent_color }}>
                      Explore stories
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">
              Want to bring 900 Homes to your neighbourhood?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              We&apos;re always looking for new communities to partner with.
              Get in touch to start collecting your neighbourhood&apos;s stories.
            </p>
          </div>
        </section>
      </main>

      {/* Simple footer */}
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} 900 Homes. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
