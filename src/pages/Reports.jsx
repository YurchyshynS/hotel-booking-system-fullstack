import { useState, useEffect } from 'react'
import { api } from '../api'

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Reports() {
  const [bookings, setBookings] = useState([])
  const [rooms,    setRooms]    = useState([])
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([api.getBookings(), api.getRooms(), api.getStats()])
      .then(([b, r, s]) => { setBookings(b); setRooms(r); setStats(s) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  // Розрахунок метрик
  const completed  = bookings.filter(b => b.status === 'завершено')
  const cancelled  = bookings.filter(b => b.status === 'скасовано')
  const active     = bookings.filter(b => ['підтверджено', 'заселено'].includes(b.status))
  const revenue    = completed.reduce((s, b) => s + (b.total_price || 0), 0)
  const avgNights  = completed.length
    ? Math.round(completed.reduce((s, b) => {
        const n = Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / (1000*60*60*24))
        return s + n
      }, 0) / completed.length)
    : 0

  // Категорії
  const byCategory = {}
  bookings.forEach(b => {
    const cat = b.room_id?.category || 'невідомо'
    if (!byCategory[cat]) byCategory[cat] = { count: 0, revenue: 0 }
    byCategory[cat].count++
    if (b.status === 'завершено') byCategory[cat].revenue += (b.total_price || 0)
  })

  // Статуси номерів
  const roomByStatus = {}
  rooms.forEach(r => {
    roomByStatus[r.status] = (roomByStatus[r.status] || 0) + 1
  })

  const occupancyRate = stats?.totalRooms
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0

  return (
    <>
      <div className="page-header">
        <h1>Звіти</h1>
        <p>Аналітика та статистика роботи готелю</p>
      </div>

      {/* Ключові метрики */}
      <div className="report-grid">
        <div className="report-metric">
          <div className="rm-label"><i className="fa-solid fa-money-bill-wave" style={{ marginRight: 6 }} />Дохід від завершених</div>
          <div className="rm-value">{revenue.toLocaleString('uk-UA')} грн</div>
          <div className="rm-sub">{completed.length} завершених бронювань</div>
        </div>
        <div className="report-metric">
          <div className="rm-label"><i className="fa-solid fa-bed" style={{ marginRight: 6 }} />Активних броней</div>
          <div className="rm-value">{active.length}</div>
          <div className="rm-sub">підтверджено + заселено</div>
        </div>
        <div className="report-metric">
          <div className="rm-label"><i className="fa-solid fa-percent" style={{ marginRight: 6 }} />Завантаженість</div>
          <div className="rm-value">{occupancyRate}%</div>
          <div className="rm-sub">{stats?.occupiedRooms} з {stats?.totalRooms} номерів</div>
        </div>
        <div className="report-metric">
          <div className="rm-label"><i className="fa-solid fa-moon" style={{ marginRight: 6 }} />Середня тривалість</div>
          <div className="rm-value">{avgNights} ніч</div>
          <div className="rm-sub">по завершених бронюваннях</div>
        </div>
        <div className="report-metric">
          <div className="rm-label"><i className="fa-solid fa-xmark-circle" style={{ marginRight: 6 }} />Скасовано</div>
          <div className="rm-value">{cancelled.length}</div>
          <div className="rm-sub">з {bookings.length} усіх бронювань</div>
        </div>
        <div className="report-metric">
          <div className="rm-label"><i className="fa-solid fa-users" style={{ marginRight: 6 }} />Унікальних гостей</div>
          <div className="rm-value">{stats?.totalGuests ?? 0}</div>
          <div className="rm-sub">у базі даних</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* По категоріях */}
        <div className="card">
          <div className="card-header">
            <i className="fa-solid fa-chart-bar" style={{ color: 'var(--accent2)' }} />
            <h2>Бронювання за категоріями</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Категорія</th>
                  <th>Кількість</th>
                  <th>Дохід (завершені)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byCategory).map(([cat, data]) => (
                  <tr key={cat}>
                    <td style={{ textTransform: 'capitalize' }}>{cat}</td>
                    <td><span className="badge badge-info">{data.count}</span></td>
                    <td><strong>{data.revenue.toLocaleString('uk-UA')} грн</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Статус номерів */}
        <div className="card">
          <div className="card-header">
            <i className="fa-solid fa-door-open" style={{ color: 'var(--success)' }} />
            <h2>Стан номерів зараз</h2>
          </div>
          <div className="card-body">
            {Object.entries(roomByStatus).map(([status, count]) => {
              const pct = Math.round((count / rooms.length) * 100)
              const colors = {
                'вільний':       'var(--success)',
                'зайнятий':      'var(--danger)',
                'заброньований': 'var(--warning)',
                'на прибиранні': '#a855f7',
              }
              return (
                <div key={status} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.83rem', textTransform: 'capitalize' }}>{status}</span>
                    <span style={{ fontSize: '0.83rem', color: 'var(--text2)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: colors[status] || 'var(--accent)',
                      borderRadius: 3, transition: 'width .5s'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Таблиця завершених бронювань */}
      <div className="card">
        <div className="card-header">
          <i className="fa-solid fa-circle-check" style={{ color: 'var(--success)' }} />
          <h2>Завершені бронювання</h2>
          <span className="badge badge-success">{completed.length}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Гість</th>
                <th>Заїзд</th>
                <th>Виїзд</th>
                <th>Вартість</th>
              </tr>
            </thead>
            <tbody>
              {completed.map(b => (
                <tr key={b._id}>
                  <td><strong>#{b.room_id?.number ?? '-'}</strong></td>
                  <td>{b.guest_id?.name ?? '-'}</td>
                  <td>{fmtDate(b.check_in)}</td>
                  <td>{fmtDate(b.check_out)}</td>
                  <td><strong>{b.total_price?.toLocaleString('uk-UA')} грн</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          {completed.length === 0 && (
            <div className="empty-state">
              <i className="fa-solid fa-clock" />
              <p>Завершених бронювань ще немає</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
