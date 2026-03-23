import { createClient } from "@/utils/supabase/server";
import type { Faq } from "@/types/database";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQ — 900 Homes",
};

interface Props {
  params: Promise<{ neighbourhood: string }>;
}

export default async function FaqPage({ params }: Props) {
  const { neighbourhood: slug } = await params;
  const prefix = `/${slug}`;
  const supabase = await createClient();

  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <HelpCircle className="h-12 w-12 nh-text mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Everything you need to know about sharing your story with 900 Homes.
        </p>
      </div>

      {faqs && faqs.length > 0 ? (
        <div className="space-y-6">
          {(faqs as Faq[]).map((faq) => (
            <div key={faq.id} className="border-b pb-6 last:border-b-0">
              <h2 className="text-lg font-semibold mb-2">{faq.question}</h2>
              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No FAQs yet. Check back soon!</p>
      )}

      <div className="mt-12 text-center p-6 nh-bg-light rounded-lg">
        <p className="font-medium mb-2">Still have questions?</p>
        <p className="text-sm text-muted-foreground mb-4">
          We&apos;d love to hear from you. Reach out or just go ahead and share your story.
        </p>
        <Link
          href={`${prefix}/submit`}
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg nh-bg text-white font-medium nh-bg-hover transition-colors"
        >
          Share Your Story
        </Link>
      </div>
    </div>
  );
}
