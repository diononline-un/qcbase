"use client"

import { useState, useEffect, useCallback } from "react"
import { createComment, deleteComment, listComments } from "./actions"
import Link from "next/link"

interface CommentData {
  id: string
  product_id: string
  user_id: string
  parent_id: string | null
  content: string
  language: string
  created_at: string
  updated_at: string
  author: { id: string; username: string; avatar_url: string | null } | null
  mentionedUsers: string[]
  replies: CommentData[]
}

interface CommentSectionProps {
  productId: string
  currentUserId: string | null
  threadId: string
}

export function CommentSection({ productId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listComments(productId)
      setComments(data)
    } catch {
      setError("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleSubmit = async (parentId: string | null) => {
    const content = parentId ? replyContent : newComment
    if (!content.trim() || !currentUserId || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const result = await createComment(productId, content, parentId)
      if (result.error) {
        setError(result.error)
      } else {
        if (parentId) {
          setReplyContent("")
          setReplyTo(null)
        } else {
          setNewComment("")
        }
        await loadComments()
      }
    } catch {
      setError("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    const result = await deleteComment(commentId)
    if (result.error) {
      setError(result.error)
    } else {
      await loadComments()
    }
  }

  const renderComment = (comment: CommentData, isReply = false) => {
    const authorName = comment.author?.username || "Unknown"
    const time = new Date(comment.created_at).toLocaleDateString()

    return (
      <div key={comment.id} className={`${isReply ? "ml-8 border-l border-zinc-200 pl-3 dark:border-zinc-700" : ""}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs">
            {authorName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/${authorName}`}
                className="font-mono text-xs font-medium hover:underline"
              >
                @{authorName}
              </Link>
              <span className="font-mono text-[10px] text-muted-foreground">{time}</span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
            <div className="mt-1 flex items-center gap-3">
              {currentUserId && (
                <button
                  onClick={() => {
                    setReplyTo(comment.id)
                    setReplyContent(`@${authorName} `)
                  }}
                  className="font-mono text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Reply
                </button>
              )}
              {currentUserId === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="font-mono text-[10px] text-muted-foreground hover:text-rose-500"
                >
                  Delete
                </button>
              )}
            </div>

            {replyTo === comment.id && (
              <div className="mt-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-background px-3 py-2 font-mono text-xs focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:focus:border-zinc-500"
                  rows={2}
                  placeholder="Write a reply... (@username to mention)"
                />
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => handleSubmit(comment.id)}
                    disabled={submitting || !replyContent.trim()}
                    className="rounded-md bg-foreground px-3 py-1 font-mono text-[10px] text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => { setReplyTo(null); setReplyContent("") }}
                    className="font-mono text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm uppercase tracking-wider">Comments</h2>
      </div>

      {currentUserId ? (
        <div className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-background px-3 py-2 font-mono text-xs focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:focus:border-zinc-500"
            rows={3}
            placeholder="Write a comment... (@username to mention)"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">Use @username to mention someone</span>
            <button
              onClick={() => handleSubmit(null)}
              disabled={submitting || !newComment.trim()}
              className="rounded-md bg-foreground px-4 py-1.5 font-mono text-xs text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              Post
            </button>
          </div>
          {error && (
            <p className="mt-2 font-mono text-[10px] text-rose-500">{error}</p>
          )}
        </div>
      ) : (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          <Link href="/login" className="underline hover:text-foreground">Login</Link> to leave a comment.
        </p>
      )}

      <div className="mt-6 space-y-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </section>
  )
}
