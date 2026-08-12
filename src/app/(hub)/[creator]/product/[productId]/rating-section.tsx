"use client"

import { useState } from "react"
import { rateProduct } from "./actions"

interface RatingSectionProps {
  productId: string
  currentRating: number | null
  avgRating: number
  ratingCount: number
  isLoggedIn: boolean
}

export function RatingSection({
  productId,
  currentRating: initialRating,
  avgRating: initialAvg,
  ratingCount: initialCount,
  isLoggedIn,
}: RatingSectionProps) {
  const [userRating, setUserRating] = useState<number | null>(initialRating)
  const [avgRating, setAvgRating] = useState(initialAvg)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const handleRate = async (rating: number) => {
    if (!isLoggedIn || pending) return
    if (rating === userRating) return

    const prevRating = userRating
    setPending(true)

    const prevAvg = avgRating
    const prevCount = count

    if (prevRating) {
      const newTotal = avgRating * count - prevRating + rating
      setAvgRating(newTotal / count)
    } else {
      const newTotal = avgRating * count + rating
      setCount((c) => c + 1)
      setAvgRating(newTotal / (count + 1))
    }
    setUserRating(rating)

    try {
      const result = await rateProduct(productId, rating)
      if (result.error) {
        setUserRating(prevRating)
        setAvgRating(prevAvg)
        setCount(prevCount)
      }
    } catch {
      setUserRating(prevRating)
      setAvgRating(prevAvg)
      setCount(prevCount)
    } finally {
      setPending(false)
    }
  }

  const displayRating = hoverRating ?? userRating ?? avgRating

  return (
    <div>
      <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Rating</h3>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              disabled={!isLoggedIn || pending}
              className={`transition-colors ${!isLoggedIn ? "cursor-not-allowed" : "cursor-pointer"}`}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <svg
                className={`h-6 w-6 ${
                  star <= displayRating
                    ? "text-amber-400"
                    : "text-zinc-200 dark:text-zinc-700"
                } ${isLoggedIn && !pending ? "hover:scale-110" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <span className="font-mono text-sm tabular-nums">
          {avgRating.toFixed(1)}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          ({count})
        </span>
      </div>
    </div>
  )
}
