import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ---- Admin routes ----
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return supabaseResponse;
    }

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // ---- Neighbourhood routes ----
  // Pattern: /[slug]/... where slug is not a known root route
  const knownRootRoutes = ["admin", "api", "auth", "_next", "favicon.ico", "about"];
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && !knownRootRoutes.includes(firstSegment)) {
    // This looks like a neighbourhood route: /[neighbourhood]/...
    const neighbourhoodSlug = firstSegment;
    const subPath = "/" + segments.slice(1).join("/");

    // Public neighbourhood pages (no auth required): login, register, confirm, and the homepage
    const publicPaths = ["/account/login", "/account/register", "/account/confirm", ""];
    const isPublicPath = publicPaths.includes(subPath) || subPath === "/";

    if (!isPublicPath) {
      // Require login for all other neighbourhood pages
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = `/${neighbourhoodSlug}/account/login`;
        return NextResponse.redirect(url);
      }

      // Verify user belongs to this neighbourhood (skip for admins)
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: profile } = await serviceClient
        .from("profiles")
        .select("role, neighbourhood_id")
        .eq("id", user.id)
        .single();

      if (profile && profile.role !== "admin" && profile.neighbourhood_id) {
        // Look up the neighbourhood slug for the user's neighbourhood
        const { data: userNeighbourhood } = await serviceClient
          .from("neighbourhoods")
          .select("slug")
          .eq("id", profile.neighbourhood_id)
          .single();

        if (userNeighbourhood && userNeighbourhood.slug !== neighbourhoodSlug) {
          // Redirect to user's own neighbourhood
          const url = request.nextUrl.clone();
          url.pathname = `/${userNeighbourhood.slug}${subPath}`;
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
