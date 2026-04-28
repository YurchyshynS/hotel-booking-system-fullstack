import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(form)
      login(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <i className="fa-solid fa-hotel" />
        </div>
        <h1>Lviv Grand Hotel</h1>
        <p className="subtitle">Система управління бронюванням</p>

        <form onSubmit={submit}>
          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handle}
              placeholder="admin@lvivgrand.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handle}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Вхід...</>
              : <><i className="fa-solid fa-right-to-bracket" /> Увійти в систему</>
            }
          </button>
        </form>

        <div className="login-hint">
          <div style={{ marginBottom: 4 }}>
            <strong>Адмін:</strong> admin@lvivgrand.com / admin123
          </div>
          <div>
            <strong>Менеджер:</strong> manager@lvivgrand.com / manager123
          </div>
        </div>
      </div>
    </div>
  )
}
