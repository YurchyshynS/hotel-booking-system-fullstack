import { useState } from 'react'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  dashboard: 'Дашборд',
  rooms:     'Управління номерами',
  bookings:  'Бронювання',
  guests:    'Гості',
  reports:   'Звіти',
}

export default function Layout({ page, onNav, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        active={page}
        onNav={onNav}
        onClose={() => setSidebarOpen(false)}
        className={sidebarOpen ? 'open' : ''}
      />

      <div className="main-content">
        <header className="topbar">
          <button
            className="topbar-menu-btn"
            onClick={() => setSidebarOpen(s => !s)}
            aria-label="Меню"
          >
            <i className="fa-solid fa-bars" />
          </button>
          <div className="topbar-title">
            Lviv Grand Hotel &nbsp;/&nbsp; <span>{PAGE_TITLES[page] || page}</span>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
