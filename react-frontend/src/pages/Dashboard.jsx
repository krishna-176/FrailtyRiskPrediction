import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/useAuth'
import { getPatients, getHistory, getMlStatus } from '../services/api.js'
import './Dashboard.css'

/* ── helpers ── */
function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

/* ── Donut Chart ── */
function DonutChart({ frail, total }) {
  const notFrail = total - frail
  const r = 54
  const circ = 2 * Math.PI * r
  const frailPct = total > 0 ? frail / total : 0
  const gap = 4
  const frailLen = circ * frailPct - gap
  const okLen = circ * (1 - frailPct) - gap

  return (
    <div className="donut-wrapper">
      <div className="donut-svg-container">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
          {total > 0 && (
            <>
              <circle
                cx="70" cy="70" r={r} fill="none"
                stroke="#22c55e" strokeWidth="14"
                strokeDasharray={`${okLen} ${circ}`}
                strokeDashoffset={-circ * frailPct - gap / 2}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              <circle
                cx="70" cy="70" r={r} fill="none"
                stroke="#e11d48" strokeWidth="14"
                strokeDasharray={`${frailLen} ${circ}`}
                strokeDashoffset={gap / 2}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </>
          )}
        </svg>
        <div className="donut-center-text">
          <span className="donut-center-value">{total}</span>
          <span className="donut-center-label">Total</span>
        </div>
      </div>
      <div className="donut-legend">
        <div className="donut-legend-item">
          <div className="donut-legend-dot" style={{ background: '#e11d48' }} />
          Frail ({frail})
        </div>
        <div className="donut-legend-item">
          <div className="donut-legend-dot" style={{ background: '#22c55e' }} />
          Not Frail ({notFrail})
        </div>
      </div>
    </div>
  )
}

/* ── Score Dots ── */
function ScoreDots({ score, isFrail }) {
  const color = isFrail ? 'score-dot--filled-frail' : 'score-dot--filled-ok'
  return (
    <div className="score-dots">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`score-dot ${i <= score ? color : ''}`} />
      ))}
    </div>
  )
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { user } = useAuth()

  // ── React Query hooks (auto-caching, background refetch) ──
  const patientsQuery = useQuery({
    queryKey: ['patients', 0],
    queryFn: () => getPatients(0).then(r => r.data),
  })
  const historyQuery = useQuery({
    queryKey: ['history', 0],
    queryFn: () => getHistory(0).then(r => r.data),
  })
  const mlStatusQuery = useQuery({
    queryKey: ['ml-status'],
    queryFn: () => getMlStatus().then(r => r.data),
    refetchInterval: 30_000, // poll every 30s
    initialData: { status: 'loading', ai_enabled: false },
  })

  const loading = patientsQuery.isLoading || historyQuery.isLoading
  const error = patientsQuery.isError || historyQuery.isError ? 'Failed to load dashboard data.' : null
  const mlStatus = mlStatusQuery.data ?? { status: 'loading', ai_enabled: false }

  // Derive stats from query data
  const patients   = patientsQuery.data
  const history    = historyQuery.data
  const totalPatients    = patients?.totalElements ?? (Array.isArray(patients) ? patients.length : 0)
  const predictions      = history?.content ?? (Array.isArray(history) ? history : [])
  const totalPredictions = history?.totalElements ?? predictions.length
  const frailCount       = predictions.filter(p => p.isFrail).length
  const recentPredictions = predictions.slice(0, 5)
  const stats = { totalPatients, totalPredictions, frailCount }

  // Animated counters (depend on stats)
  const animPatients    = useCountUp(stats.totalPatients)
  const animPredictions = useCountUp(stats.totalPredictions)
  const animFrail       = useCountUp(stats.frailCount)
  const notFrailPct     = stats.totalPredictions > 0
    ? Math.round(((stats.totalPredictions - stats.frailCount) / stats.totalPredictions) * 100)
    : 0
  const animPct = useCountUp(notFrailPct)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  /* risk breakdown buckets from recentPredictions */
  const frailPct  = stats.totalPredictions > 0 ? (stats.frailCount / stats.totalPredictions) * 100 : 0
  const okPct     = 100 - frailPct


  return (
    <div>
      {/* ── Header ── */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Doctor'} 👋</h1>
          <p>Here's what's happening with your patients today.</p>
        </div>
        <div className="dash-today-badge">
          📅 {today}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading dashboard…</div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="dash-stats-grid">
            <div className="dash-stat-card dash-stat-card--blue">
              <div className="dash-stat-info">
                <div className="dash-stat-value">{animPatients}</div>
                <div className="dash-stat-label">Total Patients</div>
                <div className="dash-stat-change">Registered in system</div>
              </div>
              <div className="dash-stat-icon">👥</div>
            </div>

            <div className="dash-stat-card dash-stat-card--indigo">
              <div className="dash-stat-info">
                <div className="dash-stat-value">{animPredictions}</div>
                <div className="dash-stat-label">Total Predictions</div>
                <div className="dash-stat-change">AI assessments run</div>
              </div>
              <div className="dash-stat-icon">🔬</div>
            </div>

            <div className="dash-stat-card dash-stat-card--rose">
              <div className="dash-stat-info">
                <div className="dash-stat-value">{animFrail}</div>
                <div className="dash-stat-label">Frail Patients</div>
                <div className="dash-stat-change">Require attention</div>
              </div>
              <div className="dash-stat-icon">⚠️</div>
            </div>

            <div className="dash-stat-card dash-stat-card--teal">
              <div className="dash-stat-info">
                <div className="dash-stat-value">{animPct}%</div>
                <div className="dash-stat-label">Healthy Rate</div>
                <div className="dash-stat-change">Not frail predictions</div>
              </div>
              <div className="dash-stat-icon">💚</div>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="dash-main-grid">
            {/* Recent Predictions */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title">
                  <div className="dash-card-title-icon" style={{ background: '#e8f0fe' }}>📋</div>
                  Recent Predictions
                </div>
                <Link to="/history" className="dash-card-link">View all →</Link>
              </div>

              {recentPredictions.length === 0 ? (
                <div className="empty-state">No predictions yet.</div>
              ) : (
                <div className="recent-list-enhanced">
                  {recentPredictions.map((p, i) => {
                    const pid = (p.patientId || 'Unknown').toString()
                    const short = pid.length > 8 ? pid.slice(-8) : pid
                    return (
                      <div key={p.id || p._id || i} className="recent-item-enhanced">
                        <div className="recent-item-left-enhanced">
                          <div className={`recent-avatar ${p.isFrail ? 'recent-avatar--frail' : 'recent-avatar--ok'}`}>
                            {p.isFrail ? '⚠️' : '✅'}
                          </div>
                          <div>
                            <div className="recent-patient-id" title={pid}>···{short}</div>
                            <div className="recent-date-enhanced">{formatDate(p.timestamp)} · {formatTime(p.timestamp)}</div>
                          </div>
                        </div>
                        <div className="recent-item-right-enhanced">
                          <ScoreDots score={p.frailtyScore} isFrail={p.isFrail} />
                          <span className={`badge ${p.isFrail ? 'badge-frail' : 'badge-not-frail'}`}>
                            {p.isFrail ? 'Frail' : 'Not Frail'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Quick Actions */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <div className="dash-card-title-icon" style={{ background: '#f0fdf4' }}>⚡</div>
                    Quick Actions
                  </div>
                </div>
                <div className="quick-action-grid">
                  <Link to="/predict" className="quick-action-card quick-action-card--primary">
                    <div className="qa-icon-wrap">🔬</div>
                    <div>
                      <div className="qa-label">New Prediction</div>
                      <div className="qa-sub">Run AI frailty assessment</div>
                    </div>
                    <span className="qa-arrow">›</span>
                  </Link>
                  <Link to="/patients" className="quick-action-card">
                    <div className="qa-icon-wrap qa-icon-wrap--indigo">👥</div>
                    <div>
                      <div className="qa-label">Manage Patients</div>
                      <div className="qa-sub">View and edit records</div>
                    </div>
                    <span className="qa-arrow">›</span>
                  </Link>
                  <Link to="/history" className="quick-action-card">
                    <div className="qa-icon-wrap qa-icon-wrap--slate">📊</div>
                    <div>
                      <div className="qa-label">View History</div>
                      <div className="qa-sub">Past prediction results</div>
                    </div>
                    <span className="qa-arrow">›</span>
                  </Link>
                </div>
              </div>

              {/* System Status */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <div className="dash-card-title-icon" style={{ background: '#f0fdf4' }}>🖥️</div>
                    System Status
                  </div>
                </div>
                <div className="health-list">
                  <div className="health-item">
                    <div className="health-item-left">
                      <div className={`health-dot health-dot--${mlStatus.status === 'ok' ? 'green' : mlStatus.status === 'loading' ? 'blue' : 'red'}`} />
                      ML Service
                    </div>
                    <span className={`health-status health-status--${mlStatus.status === 'ok' ? 'online' : mlStatus.status === 'loading' ? 'active' : 'offline'}`}>
                      {mlStatus.status === 'ok' ? 'Online' : mlStatus.status === 'loading' ? 'Checking…' : 'Offline'}
                    </span>
                  </div>
                  <div className="health-item">
                    <div className="health-item-left">
                      <div className="health-dot health-dot--green" />
                      Backend API
                    </div>
                    <span className="health-status health-status--online">Online</span>
                  </div>
                  <div className="health-item">
                    <div className="health-item-left">
                      <div className="health-dot health-dot--blue" />
                      Database
                    </div>
                    <span className="health-status health-status--active">Connected</span>
                  </div>
                  <div className="health-item">
                    <div className="health-item-left">
                      <div className={`health-dot health-dot--${mlStatus.ai_enabled ? 'green' : 'yellow'}`} />
                      OpenAI
                    </div>
                    <span className={`health-status ${mlStatus.ai_enabled ? 'health-status--ai' : 'health-status--fallback'}`}>
                      {mlStatus.status === 'loading' ? 'Checking…' : mlStatus.ai_enabled ? '✨ Active' : '📋 Rule-Based'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Risk Breakdown ── */}
          <div className="dash-risk-grid">
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title">
                  <div className="dash-card-title-icon" style={{ background: '#fce8e6' }}>📉</div>
                  Risk Distribution
                </div>
              </div>
              <div className="risk-breakdown">
                <div className="risk-bar-row">
                  <div className="risk-bar-meta">
                    <span className="risk-bar-label">✅ Not Frail</span>
                    <span className="risk-bar-count">{stats.totalPredictions - stats.frailCount} patients · {Math.round(okPct)}%</span>
                  </div>
                  <div className="risk-bar-track">
                    <div className="risk-bar-fill" style={{ width: `${okPct}%`, background: 'linear-gradient(90deg,#22c55e,#16a34a)' }} />
                  </div>
                </div>
                <div className="risk-bar-row">
                  <div className="risk-bar-meta">
                    <span className="risk-bar-label">⚠️ Frail</span>
                    <span className="risk-bar-count">{stats.frailCount} patients · {Math.round(frailPct)}%</span>
                  </div>
                  <div className="risk-bar-track">
                    <div className="risk-bar-fill" style={{ width: `${frailPct}%`, background: 'linear-gradient(90deg,#e11d48,#be123c)' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title">
                  <div className="dash-card-title-icon" style={{ background: '#ede9fe' }}>🍩</div>
                  Prediction Overview
                </div>
              </div>
              <DonutChart frail={stats.frailCount} total={stats.totalPredictions} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
