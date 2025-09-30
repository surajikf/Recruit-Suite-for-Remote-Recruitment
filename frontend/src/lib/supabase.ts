import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallback for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czzpkrtlujpejuzhdnnr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getSupabase() {
  return supabase
}