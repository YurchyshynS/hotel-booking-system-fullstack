import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

const STATUS_OPTIONS = ['вільний', 'зайнятий', 'заброньований', 'на прибиранні']
const CATEGORY_LABELS = {
  'одномісний': 'Одномісний',
  'двомісний':  'Двомісний',
  'люкс':       'Люкс',
  'сімейний':   'Сімейний',
}

function statusBadge(status) {
  const map = {
    'вільний':         'badge-success',
    'зайнятий':        'badge-danger',
    'заброньований':   'badge-warning',
    'на прибиранні':   'badge-purple',
  }
  return map[status] || 'badge-default'
}

function StatusModal({ room, onClose, onSave }) {
  const [status, setStatus] = useState(room.status)
  const [price, setPrice]   = useState(room.price_per_night)
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const save = async () => {
    setSaving(true); setErr('')
    try {
      if (status !== room.status)
        await api.updateRoomStatus(room._id, status)
      if (Number(price) !== room.price_per_night)
        await api.updateRoomPrice(room._id, Number(price))
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
          <h3><i className="fa-solid fa-door-open" style={{ marginRight: 8, color: 'var(--accent2)' }} />Номер {room.number}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="modal-body">
          {err && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" />{err}</div>}

          <div className="form-group">
            <label>Категорія</label>
            <input value={CATEGORY_LABELS[room.category] || room.category} readOnly style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label>Поверх</label>
            <input value={room.floor} readOnly style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label>Ціна за ніч (грн)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" />
          </div>
          <div className="form-group">
            <label>Статус</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Збереження...</> : <><i className="fa-solid fa-floppy-disk" /> Зберегти</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Rooms() {
  const [rooms, setRooms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ category: '', status: '' })
  const [editing, setEditing] = useState(null)
  const [view, setView]     = useState('grid') // grid | table

  const load = useCallback(() => {
    setLoading(true)
    api.getRooms()
      .then(setRooms)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = rooms.filter(r => {
    if (filter.category && r.category !== filter.category) return false
    if (filter.status   && r.status   !== filter.status)   return false
    return true
  })

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <h1>Номери</h1>
        <p>Управління номерним фондом готелю</p>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {STATUS_OPTIONS.map(s => (
          <div key={s} className="stat-card" style={{ padding: '12px 14px' }}>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>
              {rooms.filter(r => r.status === s).length}
            </div>
            <div className="stat-label" style={{ textTransform: 'capitalize' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">Усі категорії</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">Усі статуси</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('grid')}>
            <i className="fa-solid fa-grip" />
          </button>
          <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('table')}>
            <i className="fa-solid fa-list" />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="rooms-grid">
          {filtered.map(room => (
            <div key={room._id} className="room-card">
              <div className="rc-number"><i className="fa-solid fa-door-closed" style={{ marginRight: 6, color: 'var(--text3)', fontSize: '1rem' }} />#{room.number}</div>
              <div className="rc-category">{CATEGORY_LABELS[room.category] || room.category}</div>
              <div className="rc-floor"><i className="fa-solid fa-building" style={{ marginRight: 4 }} />Поверх {room.floor}</div>
              <div className="rc-price">{room.price_per_night} грн / ніч</div>
              <span className={`badge ${statusBadge(room.status)}`} style={{ marginBottom: 10, display: 'inline-flex' }}>
                {room.status}
              </span>
              <div className="rc-actions">
                <button className="btn btn-sm btn-outline" onClick={() => setEditing(room)}>
                  <i className="fa-solid fa-pen" /> Редагувати
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Категорія</th>
                  <th>Поверх</th>
                  <th>Ціна/ніч</th>
                  <th>Статус</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(room => (
                  <tr key={room._id}>
                    <td><strong>#{room.number}</strong></td>
                    <td>{CATEGORY_LABELS[room.category] || room.category}</td>
                    <td>{room.floor}</td>
                    <td>{room.price_per_night} грн</td>
                    <td><span className={`badge ${statusBadge(room.status)}`}>{room.status}</span></td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => setEditing(room)}>
                        <i className="fa-solid fa-pen" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state"><i className="fa-solid fa-door-open" /><p>Номерів не знайдено</p></div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <StatusModal
          room={editing}
          onClose={() => setEditing(null)}
          onSave={() => { setEditing(null); load() }}
        />
      )}
    </>
  )
}
