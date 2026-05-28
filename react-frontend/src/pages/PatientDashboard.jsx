import { useAuth } from '../context/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getMyPatientRecord, getMyHistory } from '../services/api'
import './PatientDashboard.css'

/* ── Helpers ────────────────────────────────────────────────── */
function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function getScoreClass(score) {
  if (score <= 1) return 'healthy'
  if (score <= 3) return 'warn'
  return 'frail'
}

function getProbClass(prob) {
  if (prob < 0.3) return 'low'
  if (prob < 0.6) return 'med'
  return 'high'
}

function ScoreBar({ score, max = 5 }) {
  const cls = getScoreClass(score)
  return (
    <div className="pd-score-cell">
      <span className="pd-score-num">{score}/{max}</span>
      <div className="pd-score-bar-wrap">
        <div
          className={`pd-score-bar-fill ${cls}`}
          style={{ width: `${(score / max) * 100}%` }}
        />
      </div>
    </div>
  )
}

function ProbBar({ prob }) {
  const cls = getProbClass(prob)
  const pct = (prob * 100).toFixed(1)
  return (
    <div className="pd-prob-cell">
      <span className="pd-prob-text">{pct}%</span>
      <div className="pd-prob-bar-wrap">
        <div
          className={`pd-prob-bar-fill ${cls}`}
          style={{ width: `${prob * 100}%` }}
        />
      </div>
    </div>
  )
}

/* ── Component ──────────────────────────────────────────────── */
export default function PatientDashboard() {
  const { user } = useAuth()

  // ── React Query: both requests run in parallel ──
  const patientQuery = useQuery({
    queryKey: ['my-patient-record'],
    queryFn: () => getMyPatientRecord().then(r => r.data),
    retry: false, // don't retry 404 (account not linked)
  })
  const historyQuery = useQuery({
    queryKey: ['my-history'],
    queryFn: () => getMyHistory().then(r => r.data),
    initialData: [],
  })

  const loading     = patientQuery.isLoading || historyQuery.isLoading
  const notLinked   = patientQuery.isError
  const patient     = patientQuery.data ?? null
  const predictions = historyQuery.data ?? []


  const latestPrediction = predictions[0]
  const statusClass = latestPrediction ? (latestPrediction.isFrail ? 'frail' : 'healthy') : null

  const COMMUNITY_ICONS = {
    Urban: '🏙️', Suburban: '🏘️', 'Small Town': '🏡', Rural: '🌾', Frontier: '⛰️',
  }

  const vitals = patient ? [
    { label: 'Age',          value: `${patient.age} yrs`,               icon: '🎂' },
    { label: 'Gender',       value: patient.gender === 0 ? '♀ Female' : '♂ Male', icon: '👤' },
    { label: 'BMI',          value: patient.bmi?.toFixed(1) ?? '—',      icon: '⚖️' },
    { label: 'Hemoglobin',   value: `${patient.hemoglobin} g/dL`,        icon: '🩸' },
    { label: 'Hematocrit',   value: `${patient.hematocrit}%`,            icon: '💉' },
    { label: 'Platelet Count', value: patient.plateletCount,             icon: '🔬' },
    { label: 'Creatinine',   value: `${patient.creatinine} mg/dL`,       icon: '🧪' },
    { label: 'Albumin',      value: `${patient.albumin} g/dL`,           icon: '🧫' },
    { label: 'Systolic BP',  value: `${patient.systolicBp} mmHg`,        icon: '❤️' },
    { label: 'Comorbidities', value: patient.numComorbidities ?? '—',    icon: '🏥' },
    { label: 'Community',    value: `${COMMUNITY_ICONS[patient.communityType] ?? ''} ${patient.communityType}`, icon: '📍' },
  ] : []

  const sdoh = patient ? [
    { label: 'Median Income',      value: patient.medianIncome ? `$${patient.medianIncome.toLocaleString()}` : '—' },
    { label: 'Poverty Rate',       value: patient.povertyRate != null ? `${patient.povertyRate}%` : '—' },
    { label: "Bachelor's Degree",  value: patient.educationBachelorsPct != null ? `${patient.educationBachelorsPct}%` : '—' },
    { label: 'Unemployment',       value: patient.unemploymentRate != null ? `${patient.unemploymentRate}%` : '—' },
    { label: 'No Insurance',       value: patient.noHealthInsurancePct != null ? `${patient.noHealthInsurancePct}%` : '—' },
    { label: 'Disability Rate',    value: patient.disabilityRate != null ? `${patient.disabilityRate}%` : '—' },
    { label: 'No Vehicle',         value: patient.noVehiclePct != null ? `${patient.noVehiclePct}%` : '—' },
    { label: 'Housing Cost',       value: patient.medianHousingCost ? `$${patient.medianHousingCost}/mo` : '—' },
  ] : []

  return (
    <div className="pd-root">

      {/* ── Page Title ───────────────────────────── */}
      <div>
        <h1 className="pd-page-title">
          <span className="pd-page-icon">🏥</span>
          My Health Profile
        </h1>
        <p className="pd-page-subtitle">Your personal health record and frailty assessment history.</p>
      </div>

      {/* ── Hero Profile Card ─────────────────────── */}
      <div className="pd-hero">
        <div className="pd-hero-banner" />
        <div className="pd-hero-body">
          <div className="pd-avatar-wrap">
            <div className="pd-avatar">{getInitials(user?.name)}</div>
          </div>
          <div className="pd-hero-info">
            <div className="pd-hero-name">{user?.name || 'Patient'}</div>
            <div className="pd-hero-role">🏥 Patient Account</div>
            <div className="pd-hero-email">{user?.email}</div>
          </div>

          {latestPrediction && (
            <div className={`pd-status-pill ${statusClass}`}>
              <div className="pd-status-label-sm">Latest Status</div>
              <div className={`pd-status-value ${statusClass}`}>
                {latestPrediction.isFrail ? '⚠️ Frail' : '✅ Healthy'}
              </div>
              <div className="pd-status-score">Score: {latestPrediction.frailtyScore} / 5</div>
              {/* Mini score bar */}
              <div className="pd-score-row" style={{ marginTop: 6, width: '100%' }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  let segCls = ''
                  if (i < latestPrediction.frailtyScore) {
                    segCls = latestPrediction.isFrail ? 'active-frail' : (latestPrediction.frailtyScore <= 2 ? 'active-healthy' : 'active-warn')
                  }
                  return <div key={i} className={`pd-score-seg ${segCls}`} />
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Body States ──────────────────────────── */}
      {loading ? (
        <div className="pd-state-card">
          <div className="pd-loading-spinner" />
          <div className="pd-state-title">Loading your health data…</div>
          <p className="pd-state-sub">Fetching your record and assessment history. This only takes a moment.</p>
        </div>
      ) : notLinked ? (
        <div className="pd-state-card">
          <div className="pd-state-icon">🔗</div>
          <div className="pd-state-title">No medical record linked yet</div>
          <p className="pd-state-sub">
            Please contact your doctor to link your patient record to this account.
            Share your username with them:
          </p>
          <span className="pd-username-chip">{user?.username}</span>
        </div>
      ) : (
        <>
          {/* ── Medical Vitals ───────────────── */}
          <div className="pd-medical-card">
            <div className="pd-section-heading">
              <div className="pd-section-icon">🩺</div>
              <div className="pd-section-title">Medical Information</div>
              <span className="pd-section-badge">{vitals.length} metrics</span>
            </div>
            <div className="pd-vitals-grid">
              {vitals.map(({ label, value, icon }) => (
                <div key={label} className="pd-vital-card">
                  <span className="pd-vital-icon">{icon}</span>
                  <div className="pd-vital-label">{label}</div>
                  <div className="pd-vital-value">{value ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Social Determinants ──────────── */}
          {sdoh.some(s => s.value !== '—') && (
            <div className="pd-sdoh-card">
              <div className="pd-section-heading">
                <div className="pd-section-icon">🏘️</div>
                <div className="pd-section-title">Social Determinants of Health</div>
              </div>
              <div className="pd-sdoh-grid">
                {sdoh.map(({ label, value }) => (
                  <div key={label} className="pd-sdoh-item">
                    <div className="pd-sdoh-label">{label}</div>
                    <div className="pd-sdoh-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Assessment History ───────────── */}
          <div className="pd-history-card">
            <div className="pd-history-card-inner">
              <div className="pd-section-heading">
                <div className="pd-section-icon">📋</div>
                <div className="pd-section-title">Frailty Assessments</div>
                {predictions.length > 0 && (
                  <span className="pd-section-badge">{predictions.length} record{predictions.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>

            {predictions.length === 0 ? (
              <div className="pd-inner-empty">
                <div className="pd-inner-empty-icon">🩺</div>
                <strong style={{ color: '#475569' }}>No assessments on record yet</strong>
                <span>Your doctor will run a frailty assessment and the results will appear here.</span>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="pd-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Frailty Score</th>
                      <th>Status</th>
                      <th>Risk Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p, idx) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {idx === 0 && (
                              <span style={{
                                background: 'rgba(99,102,241,0.1)',
                                color: '#6366f1',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '2px 7px',
                                borderRadius: 999,
                                flexShrink: 0
                              }}>LATEST</span>
                            )}
                            {new Date(p.timestamp).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td>
                          <ScoreBar score={p.frailtyScore} />
                        </td>
                        <td>
                          <span className={`pd-status-chip ${p.isFrail ? 'frail' : 'healthy'}`}>
                            {p.isFrail ? '⚠️ Frail' : '✅ Not Frail'}
                          </span>
                        </td>
                        <td>
                          {p.probability !== undefined
                            ? <ProbBar prob={p.probability} />
                            : <span style={{ color: '#94a3b8' }}>—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Notice ───────────────────────────────── */}
      <div className="pd-notice">
        <div className="pd-notice-icon">ℹ️</div>
        <p>
          Frailty assessments are conducted by your assigned doctor.
          For questions about your results, please consult your healthcare provider directly.
        </p>
      </div>

    </div>
  )
}
