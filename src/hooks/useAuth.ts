import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { checkIsAdmin, getSession, onAuthChange } from '../services/authService'
import { isSupabaseConfigured } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    const apply = async (s: Session | null) => {
      setSession(s)
      const admin = s ? await checkIsAdmin(s.user.id) : false
      if (alive) { setIsAdmin(admin); setLoading(false) }
    }
    getSession().then(apply)
    const off = onAuthChange((s) => { void apply(s) })
    return () => { alive = false; off() }
  }, [])

  return { session, isAdmin, loading }
}
