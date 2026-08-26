import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, GraduationCap, ArrowRight } from 'lucide-react'
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
          <h1 className="text-2xl font-bold text-slate-900">Plan lekcji</h1>
          <p className="mt-1 text-sm text-slate-500">
            II Liceum Ogólnokształcące im. T. Kościuszki w Sandomierzu
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <LogIn size={18} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Panel administratora</h2>
          </div>

          {session ? (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Logowanie…' : 'Zaloguj się'}
              </button>
            </form>
          )}
        </div>

        <Link
          to="/public"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
        >
          <GraduationCap size={18} />
          Przejdź do planu uczniów
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
