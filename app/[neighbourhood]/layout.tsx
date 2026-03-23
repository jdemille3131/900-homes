import { notFound } from "next/navigation";
import { getNeighbourhoodBySlug } from "@/lib/neighbourhood";
import { deriveColourPalette, colourPaletteToCssVars } from "@/lib/color-utils";
import { NeighbourhoodProvider } from "@/components/neighbourhood-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  params: Promise<{ neighbourhood: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ neighbourhood: string }> }): Promise<Metadata> {
  const { neighbourhood: slug } = await params;
  const neighbourhood = await getNeighbourhoodBySlug(slug);

  if (!neighbourhood) return { title: "Not Found" };

  return {
    title: {
      default: `900 Homes — ${neighbourhood.name}`,
      template: `%s | 900 Homes — ${neighbourhood.name}`,
    },
    description: neighbourhood.tagline || `Life stories from ${neighbourhood.name}.`,
  };
}

export default async function NeighbourhoodLayout({ children, params }: Props) {
  const { neighbourhood: slug } = await params;
  const neighbourhood = await getNeighbourhoodBySlug(slug);

  if (!neighbourhood) {
    notFound();
  }

  const palette = deriveColourPalette(neighbourhood.accent_color);
  const cssVars = colourPaletteToCssVars(palette);

  return (
    <div style={cssVars as React.CSSProperties}>
      <NeighbourhoodProvider neighbourhood={neighbourhood}>
        <SiteHeader neighbourhood={neighbourhood} />
        <main className="flex-1">{children}</main>
        <SiteFooter neighbourhood={neighbourhood} />
      </NeighbourhoodProvider>
    </div>
  );
}
