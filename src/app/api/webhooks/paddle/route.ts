import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const body = await request.json()
  const eventType = body.event_type || body.alert_name

  if (!eventType) {
    return NextResponse.json({ error: "Missing event type" }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (eventType) {
    case "subscription.created": {
      const userId = body.passthrough || body.custom_data?.user_id
      const planId = body.subscription_plan_id

      if (userId) {
        const tier = planId?.includes("creator_plus")
          ? "creator_plus"
          : planId?.includes("reseller")
          ? "reseller"
          : "creator"

        await admin
          .from("user_accounts")
          .update({ tier })
          .eq("id", userId)
      }
      break
    }

    case "subscription.cancelled": {
      const userId = body.passthrough || body.custom_data?.user_id
      if (userId) {
        await admin
          .from("user_accounts")
          .update({ tier: "free" })
          .eq("id", userId)
      }
      break
    }

    case "subscription.updated": {
      const userId = body.passthrough || body.custom_data?.user_id
      const planId = body.subscription_plan_id

      if (userId && planId) {
        const tier = planId?.includes("creator_plus")
          ? "creator_plus"
          : planId?.includes("reseller")
          ? "reseller"
          : "creator"

        await admin
          .from("user_accounts")
          .update({ tier })
          .eq("id", userId)
      }
      break
    }

    default:
      console.log("Unhandled Paddle event:", eventType)
  }

  return NextResponse.json({ received: true })
}
