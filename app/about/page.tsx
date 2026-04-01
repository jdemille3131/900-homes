import Link from "next/link";
import { ArrowLeft, Home, BookOpen, Users, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why 900 Homes?",
  description: "The story behind the storytelling project — why we believe every neighbourhood deserves to have its stories preserved.",
};

export default function AboutPage() {
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
              Why 900 Homes?
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Because the most extraordinary stories are hiding in the most ordinary places.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 shrink-0">
                <Home className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold pt-2">Stories are disappearing.</h2>
            </div>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed pl-16">
              <p>
                Every neighbourhood has them. The family that&apos;s been on the same street since the
                houses were built. The retired teacher everyone waves to. The couple who met at the
                block party in 1987. The kid who grew up, moved away, and still calls it home.
              </p>
              <p>
                These stories live in conversations over fences, at mailboxes, in driveways.
                They&apos;re rarely written down. And when the people who carry them move away or pass on,
                the stories go with them — quietly, permanently.
              </p>
              <p>
                We lose the thread of what made a place feel like <em>home</em>.
              </p>
            </div>
          </div>
        </section>

        {/* The Mission */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 shrink-0">
                <BookOpen className="h-6 w-6 text-amber-700" />
              </div>
              <h2 className="text-2xl font-bold pt-2">We&apos;re catching them before they&apos;re gone.</h2>
            </div>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed pl-16">
              <p>
                900 Homes is a community storytelling project. We go neighbourhood by neighbourhood,
                asking one simple question: <em>What&apos;s your story?</em>
              </p>
              <p>
                Some people write. Some people talk into their phone. Some share a single memory;
                others tell the whole arc of their life on a street. There&apos;s no wrong answer and
                no story too small.
              </p>
              <p>
                A retired firefighter remembering his first day on the job. A teenager describing
                what it&apos;s like to grow up on a cul-de-sac. A widow recounting how her neighbours
                showed up with casseroles for three months straight. These are the stories that
                make a neighbourhood more than just a collection of houses.
              </p>
            </div>
          </div>
        </section>

        {/* The Origin */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold pt-2">How it started.</h2>
            </div>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed pl-16">
              <p>
                It started with a conversation. Someone mentioned that the neighbourhood they grew up
                in had over 900 homes — and they&apos;d never heard the story of a single one. Not
                really. Not the <em>real</em> story.
              </p>
              <p>
                Not the developer&apos;s brochure version, but the human version. Who lived there?
                What happened behind those doors? What did it feel like to be part of that place
                at that time?
              </p>
              <p>
                The name stuck. 900 homes. 900 stories waiting to be told. And then we realized —
                every neighbourhood is like that. Every block, every street, every cul-de-sac is
                full of stories that nobody&apos;s bothered to write down.
              </p>
              <p>
                So we built a platform to change that.
              </p>
            </div>
          </div>
        </section>

        {/* The Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 shrink-0">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold pt-2">Where we&apos;re going.</h2>
            </div>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed pl-16">
              <p>
                We&apos;re building the world&apos;s largest collection of neighbourhood life stories.
                Not celebrity memoirs. Not viral moments. Just regular people in regular places,
                telling the truth about what it means to live somewhere and call it home.
              </p>
              <p>
                One neighbourhood at a time, one story at a time, we&apos;re creating a living
                archive — something future residents can find and say, <em>&quot;So that&apos;s
                who lived here before me. That&apos;s the kind of place this is.&quot;</em>
              </p>
              <p>
                Every neighbourhood has a story. We&apos;re here to make sure it gets told.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/30 text-center">
          <div className="container mx-auto px-4 max-w-xl">
            <h2 className="text-2xl font-bold mb-4">Ready to share yours?</h2>
            <p className="text-muted-foreground mb-8">
              Find your neighbourhood and add your story to the archive.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
            >
              Find Your Neighbourhood
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} 900 Homes. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
