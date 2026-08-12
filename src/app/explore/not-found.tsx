import Link from "next/link"

export default function ExploreNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="text-center space-y-4 px-4">
        <h1 className="font-mono text-2xl font-bold text-zinc-900 dark:text-white">
          Not found
        </h1>
        <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
          This explore page doesn&apos;t exist.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 font-mono text-sm text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        >
          Go to explore
        </Link>
      </div>
    </div>
  )
}
