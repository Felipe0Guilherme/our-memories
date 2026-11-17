import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase não está configurado.')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(translateAuthError(error.message))
}

export async function signOut() {
  await supabase?.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(cb: (session: Session | null) => void) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, s) => cb(s))
  return () => data.subscription.unsubscribe()
}

/** Confere na tabela `admins` (protegida por RLS) se o usuário logado é administrador. */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
  if (error) return false
  return Boolean(data)
}

function translateAuthError(msg: string) {
  if (/invalid login/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed/i.test(msg)) return 'Confirme o e-mail antes de entrar.'
  return msg
}
