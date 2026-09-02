import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, GraduationCap, ArrowRight, FileDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    setLoading(false)
    if (signInError) {
      setError('Nieprawidłowy e-mail lub hasło.')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-extrabold text-slate-900">Plan lekcji</h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-500">
            II Liceum Ogólnokształcące im. T. Kościuszki w Sandomierzu
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
              <LogIn size={18} />
            </div>
            <h2 className="font-heading text-base font-bold text-slate-900">Panel administratora</h2>
          </div>

          {session ? (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
            >
              Przejdź do panelu administratora
            </button>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="admin@2lo-sandomierz.pl"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Hasło</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
              >
                {loading ? 'Logowanie…' : 'Zaloguj się'}
              </button>
            </form>
          )}
        </div>

        <Link
          to="/public"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-600"
        >
          <GraduationCap size={18} />
          Przejdź do planu uczniów
          <ArrowRight size={16} />
        </Link>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <FileDown size={14} />
          <span>Drukuj plan (PDF):</span>
          <Link to="/drukuj/klasy" className="font-semibold text-brand-500 transition hover:text-brand-600 hover:underline">
            wszystkie klasy
          </Link>
          <span>·</span>
          <Link
            to="/drukuj/nauczyciele"
            className="font-semibold text-brand-500 transition hover:text-brand-600 hover:underline"
          >
            wszyscy nauczyciele
          </Link>
        </div>
      </div>
    </div>
  )
}
