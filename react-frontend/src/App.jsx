import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewPrediction from './pages/NewPrediction.jsx'
import Patients from './pages/Patients.jsx'
import History from './pages/History.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import PatientDashboard from './pages/PatientDashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <div className={`sidebar-overlay${sidebarOpen ? ' sidebar-overlay--visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <header className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <span className="mobile-brand">🏥 Frailty AI</span>
      </header>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<NewPrediction />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/my-profile" element={<PatientDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <AppLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
