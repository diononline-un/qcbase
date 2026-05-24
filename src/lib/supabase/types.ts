export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_accounts: {
        Row: {
          id: string
          email: string
          username: string | null
          role: "user" | "creator" | "admin"
          tier: "free" | "creator" | "creator_plus" | "reseller"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          role?: "user" | "creator" | "admin"
          tier?: "free" | "creator" | "creator_plus" | "reseller"
          avatar_url?: string | null
        }
        Update: {
          username?: string | null
          role?: "user" | "creator" | "admin"
          tier?: "free" | "creator" | "creator_plus" | "reseller"
          avatar_url?: string | null
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
        }
        Insert: {
          creator_id: string
          subdomain?: string | null
          custom_domain?: string | null
          theme?: Json | null
          banner_url?: string | null
          affiliate_codes?: Json | null
        }
        Update: {
          subdomain?: string | null
          custom_domain?: string | null
          theme?: Json | null
          banner_url?: string | null
          affiliate_codes?: Json | null
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
          sizes: string | null
          agent_cached_price: number | null
          is_oos: boolean
          last_scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          source_url: string
          normalized_url: string
          platform?: string | null
          item_id?: string | null
          title?: string | null
          sizes?: string | null
          agent_cached_price?: number | null
          is_oos?: boolean
        }
        Update: {
          title?: string | null
          sizes?: string | null
          agent_cached_price?: number | null
          is_oos?: boolean
          last_scraped_at?: string | null
        }
      }
      product_images: {
        Row: { id: string; product_id: string; url: string; is_qc: boolean; order: number; created_at: string }
        Insert: { product_id: string; url: string; is_qc?: boolean; order?: number }
        Update: { url?: string; is_qc?: boolean; order?: number }
      }
      creator_items: {
        Row: { id: string; creator_id: string; product_id: string; category: string | null; custom_title: string | null; sort_order: number; is_pinned: boolean; created_at: string }
        Insert: { creator_id: string; product_id: string; category?: string | null; custom_title?: string | null; sort_order?: number; is_pinned?: boolean }
        Update: { category?: string | null; custom_title?: string | null; sort_order?: number; is_pinned?: boolean }
      }
      click_events: {
        Row: { id: string; product_id: string; creator_id: string; agent_id: string; timestamp: string }
        Insert: { product_id: string; creator_id: string; agent_id: string }
      }
      user_collections: {
        Row: { id: string; user_id: string; name: string; is_public: boolean; created_at: string; updated_at: string }
        Insert: { user_id: string; name: string; is_public?: boolean }
        Update: { name?: string; is_public?: boolean }
      }
      collection_items: {
        Row: { id: string; collection_id: string; product_id: string; sort_order: number; added_at: string }
        Insert: { collection_id: string; product_id: string; sort_order?: number }
        Update: { sort_order?: number }
      }
    }
  }
}

export type Profile = Database["public"]["Tables"]["user_accounts"]["Row"]
export type CreatorSettings = Database["public"]["Tables"]["creator_settings"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
