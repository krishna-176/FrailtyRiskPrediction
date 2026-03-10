import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPatients, getHistory } from '../services/api.js'
import './Dashboard.css'

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString()
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, totalPredictions: 0, frailCount: 0 })
  const [recentPredictions, setRecentPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getPatients(0), getHistory(0)])
      .then(([pRes, hRes]) => {
        const patients = pRes.data
        const history = hRes.data

        const totalPatients = patients.totalElements ?? (Array.isArray(patients) ? patients.length : 0)
        const predictions = history.content ?? (Array.isArray(history) ? history : [])
        const totalPredictions = history.totalElements ?? predictions.length
        const frailCount = predictions.filter((p) => p.isFrail).length

        setStats({ totalPatients, totalPredictions, frailCount })
        setRecentPredictions(predictions.slice(0, 5))
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalPatients}</div>
              <div className="stat-label">Total Patients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalPredictions}</div>
              <div className="stat-label">Total Predictions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.frailCount}</div>
              <div className="stat-label">Frail Patients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>
                {stats.totalPredictions > 0
                  ? Math.round(((stats.totalPredictions - stats.frailCount) / stats.totalPredictions) * 100)
                  : 0}%
              </div>
              <div className="stat-label">Not Frail Rate</div>
            </div>
          </div>

          <div className="dashboard-bottom">
            <div className="card">
              <div className="card-title">Recent Predictions</div>
              {recentPredictions.length === 0 ? (
                <div className="loading">No predictions yet.</div>
              ) : (
                <div className="recent-list">
                  {recentPredictions.map((p, i) => (
                    <div key={p.id || p._id || i} className="recent-item">
                      <div className="recent-item-left">
                        <span className="recent-patient">{p.patientId || 'Unknown'}</span>
                        <span className="recent-date">{formatDate(p.timestamp)}</span>
                      </div>
                      <div className="recent-item-right">
                        <span className="recent-score">Score: {p.frailtyScore}/5</span>
                        <span className={`badge ${p.isFrail ? 'badge-frail' : 'badge-not-frail'}`}>
                          {p.isFrail ? 'Frail' : 'Not Frail'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/history" className="btn btn-secondary" style={{ marginTop: '12px', display: 'inline-block' }}>
                View All History →
              </Link>
            </div>

            <div className="card dashboard-quick">
              <div className="card-title">Quick Actions</div>
              <div className="quick-actions">
                <Link to="/predict" className="btn btn-primary quick-btn">🔬 New Prediction</Link>
                <Link to="/patients" className="btn btn-secondary quick-btn">👥 Manage Patients</Link>
                <Link to="/history" className="btn btn-secondary quick-btn">📋 View History</Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
