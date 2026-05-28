import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import './Sidebar.css'

const NAV_BY_ROLE = {
  ADMIN: [
    { to: '/admin', label: 'Admin Panel', icon: '🛡️' },
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/predict', label: 'New Prediction', icon: '🔬' },
    { to: '/patients', label: 'Patients', icon: '👥' },
    { to: '/history', label: 'History', icon: '📋' },
  ],
  DOCTOR: [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/predict', label: 'New Prediction', icon: '🔬' },
    { to: '/patients', label: 'Patients', icon: '👥' },
    { to: '/history', label: 'History', icon: '📋' },
  ],
  PATIENT: [
    { to: '/my-profile', label: 'My Profile', icon: '🏥' },
  ],
}

const ROLE_LABELS = { ADMIN: 'Admin', DOCTOR: 'Doctor', PATIENT: 'Patient' }
const ROLE_ICONS = { ADMIN: '🛡️', DOCTOR: '👨‍⚕️', PATIENT: '🏥' }

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.DOCTOR

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">🏥</span>
        <span className="sidebar-brand-text">Frailty AI</span>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">✕</button>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/my-profile' || to === '/admin'}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{icon}</span>
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <span className="sidebar-user-avatar">{ROLE_ICONS[user.role] || '👤'}</span>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">{ROLE_LABELS[user.role] || user.role}</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign out">⏏</button>
        </div>
      )}
    </aside>
  )
}
