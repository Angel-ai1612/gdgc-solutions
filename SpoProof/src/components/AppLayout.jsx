import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, LayoutDashboard, ScanSearch, FileText,
  Award, Bell, Settings, Search, LogOut
} from 'lucide-react'

export default function AppLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/auth')
  }

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'

  const sidebarLinks = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/verify', icon: ScanSearch, label: 'Verify Media' },
    { to: '/app/reports', icon: FileText, label: 'Reports' },
    { to: '/app/certificates', icon: Award, label: 'Certificates' },
    { to: '/app/alerts', icon: Bell, label: 'Alerts' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <NavLink to="/app/dashboard" className="navbar-logo">
            <div className="navbar-logo-icon" style={{ width: 22, height: 22 }}>
              <ShieldCheck size={12} color="#fff" />
            </div>
            SpoProof
          </NavLink>
        </div>
        <nav className="sidebar-nav">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <div style={{ flex: 1 }} />
          <button
            className="sidebar-link"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </nav>
      </aside>

      <main className="app-main">
        <div className="topbar">
          <div className="topbar-search">
            <Search size={14} />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="topbar-right">
            <div style={{ marginRight: 12, textAlign: 'right', display: 'none', sm: 'block' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{user?.credits || 0} Credits</div>
            </div>
            <button className="btn-icon">
              <Bell size={16} />
            </button>
            <div className="topbar-avatar" title={user?.name}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : initials}
            </div>
          </div>
        </div>
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
