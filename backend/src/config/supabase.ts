import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  throw new Error('Missing required Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.')
}

// Use service role key on the backend; trusted server operations bypass RLS.
export const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
