import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewPrediction from './pages/NewPrediction.jsx'
import Patients from './pages/Patients.jsx'
import History from './pages/History.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<NewPrediction />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
