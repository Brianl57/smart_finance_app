import './config';
import { createClient } from '@supabase/supabase-js'

// Use SERVICE_ROLE_KEY for backend to bypass RLS
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
