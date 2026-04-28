import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StatusBadge({ status }) {
  const map = {
    'підтверджено': ['badge-info',    'fa-clock'],
    'заселено':     ['badge-success', 'fa-check'],
    'завершено':    ['badge-default', 'fa-circle-check'],
    'скасовано':    ['badge-danger',  'fa-xmark'],
  }
  const [cls, icon] = map[status] || ['badge-default', 'fa-circle']
  return <span className={`badge ${cls}`}><i className={`fa-solid ${icon}`} />{status}</span>
}

function BookingModal({ rooms, guests, onClose, onSave }) {
  const [form, setForm] = useState({ room_id: '', guest_id: '', check_in: '', check_out: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')
  const [info, setInfo]     = useState('')

  const handle = e => {
    const f = { ...form, [e.target.name]: e.target.value }
    setForm(f)
    // Розраховуємо вартість
    if (f.room_id && f.check_in && f.check_out) {
      const room = rooms.find(r => r._id === f.room_id)
      if (room) {
        const nights = Math.max(0, Math.ceil(
          (new Date(f.check_out) - new Date(f.check_in)) / (1000 * 60 * 60 * 24)
        ))
        setInfo(nights > 0 ? `${nights} ніч - ${nights * room.price_per_night} грн` : '')
      }
    }
  }

  const save = async () => {
    if (!form.room_id || !form.guest_id || !form.check_in || !form.check_out) {
      setErr('Заповніть усі обов\'язкові поля'); return
    }
    setSaving(true); setErr('')
    try {
      await api.createBooking(form)
      onSave()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const freeRooms = rooms.filter(r => ['вільний', 'заброньований'].includes(r.status))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3><i className="fa-solid fa-calendar-plus" style={{ marginRight: 8, color: 'var(--accent2)' }} />Нове бронювання</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="modal-body">
          {err  && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" />{err}</div>}
          {info && <div className="alert alert-info"><i className="fa-solid fa-circle-info" />{info}</div>}

          <div className="form-group">
            <label>Номер *</label>
            <select name="room_id" value={form.room_id} onChange={handle}>
              <option value="">Оберіть номер</option>
              {freeRooms.map(r => (
                <option key={r._id} value={r._id}>
                  #{r.number} - {r.category} ({r.price_per_night} грн/ніч)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Гість *</label>
            <select name="guest_id" value={form.guest_id} onChange={handle}>
              <option value="">Оберіть гостя</option>
              {guests.map(g => (
                <option key={g._id} value={g._id}>{g.name} ({g.phone})</option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Дата заїзду *</label>
              <input type="date" name="check_in" value={form.check_in} onChange={handle}
                min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>Дата виїзду *</label>
              <input type="date" name="check_out" value={form.check_out} onChange={handle}
                min={form.check_in || new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className="form-group">
            <label>Нотатки</label>
            <textarea name="notes" value={form.notes} onChange={handle} placeholder="Додаткові побажання..." />
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Збереження...</>
                : <><i className="fa-solid fa-floppy-disk" /> Забронювати</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [rooms,    setRooms]    = useState([])
  const [guests,   setGuests]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState({ status: '' })
  const [showNew,  setShowNew]  = useState(false)
  const [actionId, setActionId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([api.getBookings(), api.getRooms(), api.getGuests()])
      .then(([b, r, g]) => { setBookings(b); setRooms(r); setGuests(g) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const doCheckIn = async (id) => {
    setActionId(id)
    try { await api.checkIn(id); load() } catch (e) { alert(e.message) }
    finally { setActionId(null) }
  }

  const doCheckOut = async (id) => {
    setActionId(id)
    try { await api.checkOut(id); load() } catch (e) { alert(e.message) }
    finally { setActionId(null) }
  }

  const doCancel = async (id) => {
    if (!confirm('Скасувати бронювання?')) return
    setActionId(id)
    try { await api.deleteBooking(id); load() } catch (e) { alert(e.message) }
    finally { setActionId(null) }
  }

  const filtered = bookings.filter(b => !filter.status || b.status === filter.status)

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <h1>Бронювання</h1>
        <p>Управління бронюваннями та заселенням гостей</p>
      </div>

      <div className="filters-bar">
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">Усі статуси</option>
          <option value="підтверджено">Підтверджено</option>
          <option value="заселено">Заселено</option>
          <option value="завершено">Завершено</option>
          <option value="скасовано">Скасовано</option>
        </select>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowNew(true)}>
          <i className="fa-solid fa-plus" /> Нове бронювання
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Гість</th>
                <th>Заїзд</th>
                <th>Виїзд</th>
                <th>Вартість</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const busy = actionId === b._id
                return (
                  <tr key={b._id}>
                    <td><strong>#{b.room_id?.number ?? '-'}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{b.room_id?.category}</span></td>
                    <td>
                      <div>{b.guest_id?.name ?? '-'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{b.guest_id?.phone}</div>
                    </td>
                    <td>{fmtDate(b.check_in)}</td>
                    <td>{fmtDate(b.check_out)}</td>
                    <td><strong>{b.total_price?.toLocaleString('uk-UA')} грн</strong></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {b.status === 'підтверджено' && (
                          <>
                            <button className="btn btn-sm btn-success" disabled={busy} onClick={() => doCheckIn(b._id)}
                              title="Заселити">
                              <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-arrow-right-to-bracket'}`} />
                            </button>
                            <button className="btn btn-sm btn-danger" disabled={busy} onClick={() => doCancel(b._id)}
                              title="Скасувати">
                              <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-trash'}`} />
                            </button>
                          </>
                        )}
                        {b.status === 'заселено' && (
                          <button className="btn btn-sm btn-warning" disabled={busy} onClick={() => doCheckOut(b._id)}
                            title="Виселити">
                            <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-right-from-bracket'}`} />
                            Виселити
                          </button>
                        )}
                        {['завершено', 'скасовано'].includes(b.status) && (
                          <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <i className="fa-solid fa-calendar-xmark" />
              <p>Бронювань не знайдено</p>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <BookingModal
          rooms={rooms}
          guests={guests}
          onClose={() => setShowNew(false)}
          onSave={() => { setShowNew(false); load() }}
        />
      )}
    </>
  )
}
