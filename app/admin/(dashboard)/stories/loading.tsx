export default function AdminStoriesLoading() {
  return (
    <div>
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
