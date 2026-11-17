import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/authService'
import { LoginForm } from './LoginForm'
import { AdminEditor } from './AdminEditor'

function Shell({ children, onSignOut }: { children: ReactNode; onSignOut?: () => void }) {
  return (
    <div style={{ minHeight: '100%', background: '#E8DDC8', color: '#292522' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', background: '#292522', color: '#E8DDC8' }}>
        <strong style={{ letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 14 }}>Administração · álbum</strong>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="#/" style={{ color: '#E8DDC8' }}>Ver o álbum</a>
          {onSignOut && <button className="ad-btn ad-btn--ghost" style={{ color: '#E8DDC8', borderColor: '#8B7562' }} onClick={onSignOut}>Sair</button>}
        </nav>
      </header>
      <main style={{ padding: '24px 22px 80px', maxWidth: 1180, margin: '0 auto' }}>{children}</main>
    </div>
  )
}

export function AdminPanel() {
  const { session, isAdmin, loading } = useAuth()

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <h1 style={{ fontWeight: 500 }}>Supabase ainda não configurado</h1>
        <p>A administração só funciona com o banco e o armazenamento em nuvem, então ela fica desativada até a configuração:</p>
        <ol style={{ lineHeight: 1.7 }}>
          <li>Crie um projeto no Supabase e execute <code>supabase/migrations/001_init.sql</code> no SQL Editor.</li>
          <li>Crie seu usuário em Authentication e registre-o como administrador (último passo do arquivo SQL).</li>
          <li>Copie <code>.env.example</code> para <code>.env.local</code> e preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> (na Vercel, em Settings → Environment Variables).</li>
        </ol>
      </Shell>
    )
  }
  if (loading) return <Shell><p>Verificando acesso…</p></Shell>
  if (!session) return <Shell><h1 style={{ fontWeight: 500, textAlign: 'center' }}>Entrar</h1><LoginForm /></Shell>
  if (!isAdmin) {
    return (
      <Shell onSignOut={() => void signOut()}>
        <h1 style={{ fontWeight: 500 }}>Sem permissão</h1>
        <p>Esta conta ({session.user.email}) não está cadastrada como administradora do álbum. Visitantes podem apenas ver o álbum.</p>
      </Shell>
    )
  }
  return <Shell onSignOut={() => void signOut()}><AdminEditor /></Shell>
}
