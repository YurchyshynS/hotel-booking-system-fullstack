import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

function GuestModal({ guest, onClose, onSave }) {
  const editing = !!guest?._id
  const [form, setForm] = useState(
    guest || { name: '', email: '', phone: '', passport_id: '', country: 'Україна' }
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const save = async () => {
    if (!form.name || !form.phone) { setErr("Ім'я та телефон обов'язкові"); return }
    setSaving(true); setErr('')
    try {
      if (editing) await api.updateGuest(guest._id, form)
      else         await api.createGuest(form)
      onSave()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>
            <i className="fa-solid fa-user-plus" style={{ marginRight: 8, color: 'var(--accent2)' }} />
            {editing ? 'Редагувати гостя' : 'Новий гість'}
          </h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="modal-body">
          {err && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" />{err}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label>Ім'я *</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Іван Петренко" />
            </div>
            <div className="form-group">
              <label>Телефон *</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="+38067..." />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="email@mail.com" />
            </div>
            <div className="form-group">
              <label>Серія паспорта</label>
              <input name="passport_id" value={form.passport_id} onChange={handle} placeholder="AB123456" />
            </div>
            <div className="form-group">
              <label>Країна</label>
              <input name="country" value={form.country} onChange={handle} placeholder="Україна" />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Збереження...</>
                : <><i className="fa-solid fa-floppy-disk" /> {editing ? 'Зберегти' : 'Додати'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Guests() {
  const [guests, setGuests]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(null) // null | {} | guest obj

  const load = useCallback(() => {
    setLoading(true)
    api.getGuests()
      .then(setGuests)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = guests.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.phone?.includes(search) ||
    g.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <h1>Гості</h1>
        <p>Картотека гостей готелю</p>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <i className="fa-solid fa-magnifying-glass" style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)'
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Пошук за ім'ям, телефоном або email..."
            style={{ paddingLeft: 32 }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          <i className="fa-solid fa-user-plus" /> Новий гість
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ім'я</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Паспорт</th>
                <th>Країна</th>
                <th>Послуги</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar-sm" style={{ width: 28, height: 28, fontSize: '0.68rem' }}>
                        {g.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <strong>{g.name}</strong>
                    </div>
                  </td>
                  <td><i className="fa-solid fa-phone" style={{ marginRight: 4, color: 'var(--text3)' }} />{g.phone}</td>
                  <td>{g.email || <span style={{ color: 'var(--text3)' }}>-</span>}</td>
                  <td>{g.passport_id || <span style={{ color: 'var(--text3)' }}>-</span>}</td>
                  <td>{g.country}</td>
                  <td>
                    {g.services?.length > 0
                      ? <span className="badge badge-info">{g.services.length} послуг</span>
                      : <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>-</span>
                    }
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => setModal(g)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <i className="fa-solid fa-users-slash" />
              <p>{search ? 'Нічого не знайдено' : 'Гостей поки немає'}</p>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <GuestModal
          guest={modal?._id ? modal : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}
    </>
  )
}
