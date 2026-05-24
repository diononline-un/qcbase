import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  title: string
  sourceUrl: string
  price: number | null
  platform: string
  creatorSlug: string
  status: "pending" | "opened" | "done" | "oos"
}

interface CartState {
  items: CartItem[]
  agentWindow: Window | null
  currentIndex: number

  addItem: (item: Omit<CartItem, "status">) => void
  removeItem: (id: string) => void
  clearCart: () => void
  setItemStatus: (id: string, status: CartItem["status"]) => void
  setCurrentIndex: (index: number) => void
  setAgentWindow: (win: Window | null) => void
  launchAgent: () => void
  nextProduct: () => void
  prevProduct: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agentWindow: null,
      currentIndex: 0,

      addItem: (item) => {
        const { items } = get()
        if (items.find((i) => i.id === item.id)) return
        set({ items: [...items, { ...item, status: "pending" as const }] })
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      clearCart: () => set({ items: [], currentIndex: 0, agentWindow: null }),

      setItemStatus: (id, status) => {
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, status } : i)),
        })
      },

      setCurrentIndex: (index) => set({ currentIndex: index }),

      setAgentWindow: (win) => set({ agentWindow: win }),

      launchAgent: () => {
        const { items, currentIndex } = get()
        if (items.length === 0) return

        const item = items[currentIndex]
        if (!item) return

        // Build agent URL using GTBuy as default
        const encoded = encodeURIComponent(item.sourceUrl)
        const url = `https://gtbuy.com/item?url=${encoded}&inviteCode=PSKAK696A`

        const existing = get().agentWindow
        if (existing && !existing.closed) {
          existing.location.href = url
          existing.focus()
        } else {
          const win = window.open(url, "qcbase-agent", "width=1200,height=800")
          if (win) set({ agentWindow: win })
        }

        set({ items: items.map((i, idx) => (idx === currentIndex ? { ...i, status: "opened" as const } : i)) })
      },

      nextProduct: () => {
        const { items, currentIndex } = get()
        const next = Math.min(currentIndex + 1, items.length - 1)
        set({ currentIndex: next })
        get().launchAgent()
      },

      prevProduct: () => {
        const { items, currentIndex } = get()
        const prev = Math.max(currentIndex - 1, 0)
        set({ currentIndex: prev })
        get().launchAgent()
      },
    }),
    {
      name: "qcbase-cart",
      partialize: (state) => ({
        items: state.items.map((i) => ({ ...i, status: "pending" as const })),
        currentIndex: 0,
      }),
    }
  )
)
