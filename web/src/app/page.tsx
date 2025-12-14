import { redirect } from "next/navigation"
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Home() {
  // Check if user is authenticated
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect authenticated users to dashboard, others to login
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}
