import { useState } from 'react'
import { signIn } from '../../services/authService'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError(null)
    try { await signIn(email.trim(), password) }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível entrar.') }
    finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360, margin: '0 auto', display: 'grid', gap: 14 }}>
      <label style={{ display: 'grid', gap: 4 }}>E-mail
        <input className="ad-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>Senha
        <input className="ad-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <div role="alert" style={{ color: '#8a3a2e' }}>{error}</div>}
      <button className="ad-btn" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
    </form>
  )
}
