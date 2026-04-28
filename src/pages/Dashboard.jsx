import { useState, useEffect } from 'react'
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
  return (
    <span className={`badge ${cls}`}>
      <i className={`fa-solid ${icon}`} />
      {status}
    </span>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getStats(), api.getBookings()])
      .then(([s, b]) => { setStats(s); setBookings(b) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  const active = bookings.filter(b => ['підтверджено', 'заселено'].includes(b.status))
  const today = new Date().toDateString()
  const todayCheckIns = bookings.filter(b => new Date(b.check_in).toDateString() === today)

  const occupancy = stats?.totalRooms
    ? Math.round(((stats.occupiedRooms + (stats.totalRooms - stats.freeRooms - stats.occupiedRooms)) / stats.totalRooms) * 100)
    : 0

  return (
    <>
      <div className="page-header">
        <h1>Дашборд</h1>
        <p>Загальна статистика готелю на сьогодні</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-indigo"><i className="fa-solid fa-door-open" /></div>
          <div className="stat-value">{stats?.totalRooms ?? '-'}</div>
          <div className="stat-label">Усього номерів</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green"><i className="fa-solid fa-circle-check" /></div>
          <div className="stat-value">{stats?.freeRooms ?? '-'}</div>
          <div className="stat-label">Вільних</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-amber"><i className="fa-solid fa-person" /></div>
          <div className="stat-value">{stats?.occupiedRooms ?? '-'}</div>
          <div className="stat-label">Зайнятих</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue"><i className="fa-solid fa-users" /></div>
          <div className="stat-value">{stats?.totalGuests ?? '-'}</div>
          <div className="stat-label">Гостей у базі</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple"><i className="fa-solid fa-calendar-check" /></div>
          <div className="stat-value">{stats?.activeBookings ?? '-'}</div>
          <div className="stat-label">Активних броней</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-red"><i className="fa-solid fa-percent" /></div>
          <div className="stat-value">{occupancy}%</div>
          <div className="stat-label">Завантаженість</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Today check-ins */}
        <div className="card">
          <div className="card-header">
            <i className="fa-solid fa-arrow-right-to-bracket" style={{ color: 'var(--success)' }} />
            <h2>Заїзди сьогодні</h2>
            <span className="badge badge-success">{todayCheckIns.length}</span>
          </div>
          <div className="card-body">
            {todayCheckIns.length === 0
              ? <div className="empty-state"><i className="fa-solid fa-calendar-xmark" /><p>Немає заїздів сьогодні</p></div>
              : todayCheckIns.map(b => (
                <div key={b._id} className="booking-card-item" style={{ marginBottom: 8 }}>
                  <div className="bc-top">
                    <span className="bc-room">№ {b.room_id?.number ?? b.room_id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="bc-guest"><i className="fa-solid fa-user" style={{ marginRight: 6, color: 'var(--text3)' }} />{b.guest_id?.name ?? 'Гість'}</div>
                  <div className="bc-dates"><i className="fa-solid fa-arrow-right" style={{ marginRight: 4 }} />Виїзд: {fmtDate(b.check_out)}</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Active bookings */}
        <div className="card">
          <div className="card-header">
            <i className="fa-solid fa-list-check" style={{ color: 'var(--accent2)' }} />
            <h2>Активні бронювання</h2>
            <span className="badge badge-info">{active.length}</span>
          </div>
          <div className="card-body">
            {active.length === 0
              ? <div className="empty-state"><i className="fa-solid fa-calendar-xmark" /><p>Немає активних</p></div>
              : active.slice(0, 5).map(b => (
                <div key={b._id} className="booking-card-item" style={{ marginBottom: 8 }}>
                  <div className="bc-top">
                    <span className="bc-room">№ {b.room_id?.number ?? b.room_id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="bc-guest"><i className="fa-solid fa-user" style={{ marginRight: 6, color: 'var(--text3)' }} />{b.guest_id?.name ?? 'Гість'}</div>
                  <div className="bc-dates">
                    {fmtDate(b.check_in)} - {fmtDate(b.check_out)}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}
