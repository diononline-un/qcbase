export function createPaddleCheckout(tier: string, userId: string) {
  // Placeholder - integrate Paddle SDK when API key is available
  console.log(`Paddle checkout for tier: ${tier}, user: ${userId}`)
}

export function getPaddlePriceIds(): Record<string, string> {
  return {
    creator: process.env.PADDLE_PRICE_CREATOR || "pri_placeholder_creator",
    creator_plus: process.env.PADDLE_PRICE_CREATOR_PLUS || "pri_placeholder_creator_plus",
    reseller: process.env.PADDLE_PRICE_RESELLER || "pri_placeholder_reseller",
  }
}
