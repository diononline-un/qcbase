export default function CreatorHubLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-48 w-full animate-pulse bg-muted sm:h-64" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="mt-8 grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square animate-pulse bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
