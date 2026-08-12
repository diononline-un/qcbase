"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4 px-4">
        <h1 className="font-mono text-2xl font-bold text-white">
          Something went wrong
        </h1>
        <p className="font-mono text-sm text-zinc-400">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-sm text-white hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
