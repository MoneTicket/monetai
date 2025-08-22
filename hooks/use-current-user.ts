import { useEffect, useState } from 'react'
import { type User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchInitialSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    }

    fetchInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return user
}
