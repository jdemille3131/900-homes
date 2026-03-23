import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface Props {
  params: Promise<{ neighbourhood: string }>;
}

export default async function SubmitSuccessPage({ params }: Props) {
  const { neighbourhood: slug } = await params;
  const prefix = `/${slug}`;

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
      <p className="text-muted-foreground mb-4">
        Your story has been submitted and is now being reviewed. Once approved,
        it will appear on the stories page for everyone to read.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        If you&apos;re signed in, you can track your story&apos;s status on your{" "}
        <Link href={`${prefix}/account/stories`} className="nh-text hover:underline font-medium">
          My Stories
        </Link>{" "}
        page.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`${prefix}/submit`}
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg nh-bg text-white font-medium nh-bg-hover transition-colors"
        >
          Submit Another
        </Link>
        <Link
          href={`${prefix}/stories`}
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-border bg-background font-medium hover:bg-muted transition-colors"
        >
          Browse Stories
        </Link>
      </div>
    </div>
  );
}
