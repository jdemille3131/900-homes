import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        This page doesn&apos;t exist — but the stories of Raintree Village do.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg nh-bg text-white font-medium nh-bg-hover transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/stories"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-border bg-background font-medium hover:bg-muted transition-colors"
        >
          Browse Stories
        </Link>
      </div>
    </div>
  );
}
