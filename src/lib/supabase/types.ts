export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          role: "user" | "creator" | "admin"
          tier: "free" | "creator" | "creator_plus" | "reseller"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          role?: "user" | "creator" | "admin"
          tier?: "free" | "creator" | "creator_plus" | "reseller"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          role?: "user" | "creator" | "admin"
          tier?: "free" | "creator" | "creator_plus" | "reseller"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      creator_settings: {
        Row: {
          id: string
          creator_id: string
          subdomain: string | null
          custom_domain: string | null
          theme: Json | null
          banner_url: string | null
          affiliate_codes: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          subdomain?: string | null
          custom_domain?: string | null
          theme?: Json | null
          banner_url?: string | null
          affiliate_codes?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          subdomain?: string | null
          custom_domain?: string | null
          theme?: Json | null
          banner_url?: string | null
          affiliate_codes?: Json | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          source_url: string
          normalized_url: string
          platform: string | null
          item_id: string | null
          title: string | null
          agent_cached_price: number | null
          is_oos: boolean
          last_scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_url: string
          normalized_url: string
          platform?: string | null
          item_id?: string | null
          title?: string | null
          agent_cached_price?: number | null
          is_oos?: boolean
          last_scraped_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          source_url?: string
          normalized_url?: string
          platform?: string | null
          item_id?: string | null
          title?: string | null
          agent_cached_price?: number | null
          is_oos?: boolean
          last_scraped_at?: string | null
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          is_qc: boolean
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          is_qc?: boolean
          order?: number
          created_at?: string
        }
        Update: {
          url?: string
          is_qc?: boolean
          order?: number
        }
      }
      creator_items: {
        Row: {
          id: string
          creator_id: string
          product_id: string
          category: string | null
          custom_title: string | null
          sort_order: number
          is_pinned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          product_id: string
          category?: string | null
          custom_title?: string | null
          sort_order?: number
          is_pinned?: boolean
          created_at?: string
        }
        Update: {
          category?: string | null
          custom_title?: string | null
          sort_order?: number
          is_pinned?: boolean
        }
      }
      click_events: {
        Row: {
          id: string
          product_id: string
          creator_id: string
          agent_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          product_id: string
          creator_id: string
          agent_id: string
          timestamp?: string
        }
        Update: {
          product_id?: string
          creator_id?: string
          agent_id?: string
          timestamp?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      user_role: "user" | "creator" | "admin"
      subscription_tier: "free" | "creator" | "creator_plus" | "reseller"
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

export type Profile = Tables<"profiles">
export type CreatorSettings = Tables<"creator_settings">
export type Product = Tables<"products">
export type ProductImage = Tables<"product_images">
export type CreatorItem = Tables<"creator_items">
export type ClickEvent = Tables<"click_events">
