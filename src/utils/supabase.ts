import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import https://pfztflimkvgigltpqxih.supabase.co
const supabaseKey = import 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

// Only create the client if credentials are present
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
