import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-3 w-24 bg-muted animate-pulse rounded mt-3" />
      </CardContent>
    </Card>
  );
}

export default function StoriesLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-9 w-32 bg-muted animate-pulse rounded mb-2" />
      <div className="h-5 w-64 bg-muted animate-pulse rounded mb-8" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
