"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export async function rateProduct(productId: string, rating: number) {
  if (rating < 1 || rating > 5) return { error: "Invalid rating" }

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  if (!sessionToken) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: sessionUser } = await admin
    .from("user_sessions")
    .select("user_id")
    .eq("token", sessionToken)
    .single()

  if (!sessionUser) return { error: "Invalid session" }

  const userId = sessionUser.user_id

  try {
    const existingResult = await admin
      .from("product_ratings")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (existingResult.data) {
      await admin.from("product_ratings").delete().eq("id", existingResult.data.id)
    }

    await admin.from("product_ratings").insert({
      user_id: userId,
      product_id: productId,
      rating,
    })

    return { success: true }
  } catch (e) {
    return { error: "Failed to rate product" }
  }
}

export async function createComment(
  productId: string,
  content: string,
  parentId: string | null
) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  if (!sessionToken) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: sessionUser } = await admin
    .from("user_sessions")
    .select("user_id")
    .eq("token", sessionToken)
    .single()

  if (!sessionUser) return { error: "Invalid session" }

  const userId = sessionUser.user_id

  try {
    const result = await admin.from("product_comments").insert({
      product_id: productId,
      user_id: userId,
      content: content.trim(),
      parent_id: parentId || null,
    }).select("id").single()

    const comment = result.data
    if (!comment) return { error: "Failed to create comment" }

    const mentionRegex = /@(\w+)/g
    const mentions = [...content.matchAll(mentionRegex)].map((m) => m[1])

    if (mentions.length > 0) {
      const result2 = await admin
        .from("user_accounts")
        .select("id, username")
        .in("username", mentions)

      const mentionedUsers = result2.data as any[]
      if (mentionedUsers && mentionedUsers.length > 0) {
        for (const u of mentionedUsers) {
          try {
            await admin.from("comment_mentions").insert({
              comment_id: comment.id,
              mentioned_user_id: u.id,
            })
          } catch {}
        }
      }
    }

    return { success: true, commentId: comment.id }
  } catch {
    return { error: "Failed to create comment" }
  }
}

export async function deleteComment(commentId: string) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  if (!sessionToken) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: sessionUser } = await admin
    .from("user_sessions")
    .select("user_id")
    .eq("token", sessionToken)
    .single()

  if (!sessionUser) return { error: "Invalid session" }

  try {
    const { data: comment } = await admin
      .from("product_comments")
      .select("user_id")
      .eq("id", commentId)
      .single()

    if (!comment || comment.user_id !== sessionUser.user_id) {
      return { error: "Not authorized" }
    }

    await admin.from("product_comments").delete().eq("id", commentId)
    return { success: true }
  } catch {
    return { error: "Failed to delete comment" }
  }
}

export async function listComments(
  productId: string
) {
  const admin = createAdminClient()

  const result = await admin
    .from("product_comments")
    .select("id, product_id, user_id, parent_id, content, language, created_at, updated_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: true })

  const comments = result.data as any[]
  if (!comments || comments.length === 0) return []

  const userIds = [...new Set(comments.map((c: any) => c.user_id))]
  const usersResult = await admin
    .from("user_accounts")
    .select("id, username, avatar_url")
    .in("id", userIds)

  const users = usersResult.data as any[]
  const userMap = new Map<string, any>()
  users?.forEach((u: any) => userMap.set(u.id, u))

  const commentIds = comments.map((c: any) => c.id)
  const mentionsResult = await admin
    .from("comment_mentions")
    .select("comment_id, mentioned_user_id")
    .in("comment_id", commentIds)

  const mentions = mentionsResult.data as any[]
  const mentionMap = new Map<string, string[]>()
  mentions?.forEach((m: any) => {
    const mentionedUser = userMap.get(m.mentioned_user_id)
    if (mentionedUser) {
      const arr = mentionMap.get(m.comment_id) || []
      arr.push(mentionedUser.username)
      mentionMap.set(m.comment_id, arr)
    }
  })

  return comments.map((c: any) => ({
    ...c,
    author: userMap.get(c.user_id) || null,
    mentionedUsers: mentionMap.get(c.id) || [],
    replies: comments.filter((r: any) => r.parent_id === c.id),
  })).filter((c: any) => !c.parent_id)
}

export async function addToCollection(collectionId: string, productId: string) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  if (!sessionToken) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: sessionUser } = await admin
    .from("user_sessions")
    .select("user_id")
    .eq("token", sessionToken)
    .single()

  if (!sessionUser) return { error: "Invalid session" }

  const { data: collection } = await admin
    .from("user_collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", sessionUser.user_id)
    .single()

  if (!collection) return { error: "Collection not found" }

  const { data: existing } = await admin
    .from("collection_items")
    .select("id")
    .eq("collection_id", collectionId)
    .eq("product_id", productId)
    .single()

  if (existing) return { error: "Already in collection" }

  await admin.from("collection_items").insert({
    collection_id: collectionId,
    product_id: productId,
  })

  revalidatePath(`/collections/${collectionId}`)
  return { success: true }
}
