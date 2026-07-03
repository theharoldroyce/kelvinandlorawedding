import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Server-only Supabase client using the service-role key.
 * Never import this into client components — the service key bypasses RLS.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    )
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
