import { AuthProvider, useAuth } from './context/AuthContext'
import Login    from './pages/Login'
import Layout   from './components/Layout'
import Dashboard from './pages/Dashboard'
import Rooms    from './pages/Rooms'
import Bookings from './pages/Bookings'
import Guests   from './pages/Guests'
import Reports  from './pages/Reports'
import { useState } from 'react'

const PAGES = {
  dashboard: <Dashboard />,
  rooms:     <Rooms />,
  bookings:  <Bookings />,
  guests:    <Guests />,
  reports:   <Reports />,
}

function AppInner() {
  const { user } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (!user) return <Login />

  return (
    <Layout page={page} onNav={setPage}>
      {PAGES[page] || <Dashboard />}
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
