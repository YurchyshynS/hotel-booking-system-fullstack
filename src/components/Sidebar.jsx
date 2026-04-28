import { useAuth } from '../context/AuthContext'

const NAV = [
  {
    section: 'Головне',
    items: [
      { id: 'dashboard', label: 'Дашборд',    icon: 'fa-chart-pie' },
    ]
  },
  {
    section: 'Управління',
    items: [
      { id: 'rooms',    label: 'Номери',     icon: 'fa-door-open' },
      { id: 'bookings', label: 'Бронювання', icon: 'fa-calendar-check' },
      { id: 'guests',   label: 'Гості',      icon: 'fa-users' },
    ]
  },
  {
    section: 'Аналітика',
    items: [
      { id: 'reports',  label: 'Звіти',      icon: 'fa-chart-bar' },
    ]
  }
]

export default function Sidebar({ active, onNav, onClose, className }) {
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'АД'

  return (
    <aside className={`sidebar${className ? ' ' + className : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon"><i className="fa-solid fa-hotel" /></div>
        <div>
          <h2>Lviv Grand</h2>
          <span>Hotel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="nav-section">{group.section}</div>
            {group.items.map(item => (
              <button
                key={item.id}
                className={`nav-item${active === item.id ? ' active' : ''}`}
                onClick={() => { onNav(item.id); onClose?.() }}
              >
                <i className={`fa-solid ${item.icon}`} />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar-sm">{initials}</div>
          <div className="sidebar-user-info">
            <div className="uname">{user?.name}</div>
            <div className="urole">{user?.role === 'admin' ? 'Адміністратор' : 'Менеджер'}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket" />
          Вийти
        </button>
      </div>
    </aside>
  )
}
