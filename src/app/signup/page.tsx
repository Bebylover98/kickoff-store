'use client'
import { createClient } from '@/utils/supabase/client'

export default function SignupPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error(error.message)
  }

  return (
    <button onClick={signInWithGoogle}>
      Continue with Google
    </button>
  )
}