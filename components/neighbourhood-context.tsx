"use client";

import { createContext, useContext } from "react";
import type { Neighbourhood } from "@/types/database";

interface NeighbourhoodContextValue {
  neighbourhood: Neighbourhood;
  /** Prefix a path with the neighbourhood slug, e.g. href("/stories") => "/raintree-village/stories" */
  href: (path: string) => string;
}

const NeighbourhoodContext = createContext<NeighbourhoodContextValue | null>(null);

export function NeighbourhoodProvider({
  neighbourhood,
  children,
}: {
  neighbourhood: Neighbourhood;
  children: React.ReactNode;
}) {
  const href = (path: string) => `/${neighbourhood.slug}${path}`;

  return (
    <NeighbourhoodContext.Provider value={{ neighbourhood, href }}>
      {children}
    </NeighbourhoodContext.Provider>
  );
}

export function useNeighbourhood() {
  const ctx = useContext(NeighbourhoodContext);
  if (!ctx) {
    throw new Error("useNeighbourhood must be used within a NeighbourhoodProvider");
  }
  return ctx;
}
