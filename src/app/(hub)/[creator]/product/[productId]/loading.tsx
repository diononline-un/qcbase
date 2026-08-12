export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 animate-pulse border-b bg-muted" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse bg-muted" />
          <div className="space-y-4">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
