import Link from "next/link";
import { BookOpen, Mic, PenLine } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-background py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Every home has a story.
            <br />
            <span className="text-amber-700">What&apos;s yours?</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
            900 Homes collects the life stories of your neighbourhood — the
            memories, the moments, and the people that make a place feel like
            home. Share yours today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition-colors"
            >
              Share Your Story
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-border bg-background font-medium hover:bg-muted transition-colors"
            >
              Read Stories
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <PenLine className="h-7 w-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-semibold">Write</h3>
              <p className="text-muted-foreground">
                Tell us about your neighbourhood — a memory, a neighbour, a
                place that matters to you.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <Mic className="h-7 w-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-semibold">Record</h3>
              <p className="text-muted-foreground">
                Prefer to speak? Record audio or upload a video of your story
                directly from your device.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <BookOpen className="h-7 w-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-semibold">Discover</h3>
              <p className="text-muted-foreground">
                Browse stories from neighbourhoods everywhere and find the
                threads that connect us all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Your story matters.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            No story is too small. Whether it&apos;s a childhood memory, a funny
            encounter, or a quiet moment of belonging — we want to hear it.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
