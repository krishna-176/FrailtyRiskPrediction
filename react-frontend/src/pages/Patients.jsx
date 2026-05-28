import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPatients, createPatient, deletePatient, getUserByUsername } from '../services/api.js'
import './Patients.css'

const EMPTY_FORM = {
  patientUsername: '',
  name: '', age: '', gender: '0', bmi: '', hemoglobin: '', hematocrit: '',
  plateletCount: '', numComorbidities: '', systolicBp: '', creatinine: '', albumin: '',
  communityType: 'Urban', medianIncome: '', povertyRate: '', educationBachelorsPct: '',
  unemploymentRate: '', noHealthInsurancePct: '', disabilityRate: '',
  noVehiclePct: '', medianHousingCost: '',
}

const COMMUNITY_TYPES = ['Urban', 'Suburban', 'Small Town', 'Rural', 'Frontier']

const COMMUNITY_ICONS = {
  Urban: '🏙️', Suburban: '🏘️', 'Small Town': '🏡', Rural: '🌾', Frontier: '⛰️',
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function ComorbidityDots({ count, max = 5 }) {
  return (
    <div className="comorbidities-display">
      <div className="comorbidities-dots">
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={`comorbidity-dot${i < count ? ' filled' : ''}`} />
        ))}
      </div>
      <span className="comorbidities-num">{count}</span>
    </div>
  )
}

export default function Patients() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [formError, setFormError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')

  // ── Fetch patients (auto-cached per page) ──
  const { data, isLoading: loading } = useQuery({
    queryKey: ['patients', page],
    queryFn: () => getPatients(page).then(r => r.data),
    keepPreviousData: true,   // keep old page data visible while fetching new page
  })

  const patients   = data?.content ?? (Array.isArray(data) ? data : [])
  const totalPages = data?.totalPages ?? 1

  // ── Create patient mutation ──
  const createMutation = useMutation({
    mutationFn: (payload) => createPatient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      setShowForm(false)
      setFormValues(EMPTY_FORM)
      setFormError(null)
    },
    onError: (err) => {
      setFormError(err?.response?.data?.message || 'Failed to create patient.')
    },
  })

  // ── Delete patient mutation ──
  const deleteMutation = useMutation({
    mutationFn: (id) => deletePatient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
    onError: () => setFormError('Failed to delete patient.'),
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    let resolvedUserId = undefined
    if (formValues.patientUsername?.trim()) {
      try {
        const userRes = await getUserByUsername(formValues.patientUsername.trim())
        resolvedUserId = userRes.data.id
      } catch {
        setFormError(`Patient account "${formValues.patientUsername}" not found. Please check the username.`)
        return
      }
    }
    const payload = {
      ...formValues,
      userId: resolvedUserId,
      age: parseFloat(formValues.age),
      gender: parseInt(formValues.gender, 10),
      bmi: parseFloat(formValues.bmi),
      hemoglobin: parseFloat(formValues.hemoglobin),
      hematocrit: parseFloat(formValues.hematocrit),
      plateletCount: parseFloat(formValues.plateletCount),
      numComorbidities: parseInt(formValues.numComorbidities),
      systolicBp: parseFloat(formValues.systolicBp),
      creatinine: parseFloat(formValues.creatinine),
      albumin: parseFloat(formValues.albumin),
      medianIncome: parseFloat(formValues.medianIncome),
      povertyRate: parseFloat(formValues.povertyRate),
      educationBachelorsPct: parseFloat(formValues.educationBachelorsPct),
      unemploymentRate: parseFloat(formValues.unemploymentRate),
      noHealthInsurancePct: parseFloat(formValues.noHealthInsurancePct),
      disabilityRate: parseFloat(formValues.disabilityRate),
      noVehiclePct: parseFloat(formValues.noVehiclePct),
      medianHousingCost: parseFloat(formValues.medianHousingCost),
    }
    createMutation.mutate(payload)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this patient record? This action cannot be undone.')) return
    deleteMutation.mutate(id)
  }

  const filtered = patients.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const maleCount   = patients.filter(p => p.gender === 1).length
  const femaleCount = patients.filter(p => p.gender === 0).length
  const saving = createMutation.isPending
  const error  = formError


  return (
    <div>
      {/* ── Header ──────────────────────────────────── */}
      <div className="patients-header">
        <div className="patients-header-left">
          <h1 className="patients-page-title">
            <span className="patients-title-icon">👥</span>
            Patient Directory
          </h1>
          <p className="patients-page-subtitle">
            Manage records, link accounts, and track patient data.
          </p>
        </div>
        <button
          className={`btn-new-patient${showForm ? ' cancel' : ''}`}
          onClick={() => { setShowForm(!showForm); setError(null) }}
        >
          {showForm ? (
            <><span>✕</span> Cancel</>
          ) : (
            <><span>＋</span> New Patient</>
          )}
        </button>
      </div>

      {/* ── Error ───────────────────────────────────── */}
      {error && (
        <div className="patients-alert">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* ── Create Form ─────────────────────────────── */}
      {showForm && (
        <div className="patient-form-card">
          <div className="form-card-header">
            <div className="form-card-icon">✨</div>
            <div className="form-card-title">Create New Patient Record</div>
          </div>

          <div className="form-card-body">
            <form onSubmit={handleCreate}>

              {/* Link account */}
              <div className="link-account-banner">
                <label className="form-label" style={{ marginBottom: 6, display: 'block', color: '#6366f1' }}>
                  🔗 Link Patient Account <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.82rem' }}>(optional)</span>
                </label>
                <input
                  className="form-input"
                  name="patientUsername"
                  value={formValues.patientUsername}
                  onChange={handleChange}
                  placeholder="Enter the patient's login username to link their portal account"
                />
                <div className="link-account-hint">
                  <span>ℹ️</span>
                  <span>If provided, the patient can see this record and their assessments when they log in to the portal.</span>
                </div>
              </div>

              {/* Personal info */}
              <div className="form-section-label">👤 Personal Information</div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" name="name" value={formValues.name} onChange={handleChange} required placeholder="e.g. John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Age (years)</label>
                  <input className="form-input" type="number" name="age" value={formValues.age} onChange={handleChange} min={50} max={90} required placeholder="50 – 90" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" name="gender" value={formValues.gender} onChange={handleChange}>
                    <option value="0">♀ Female</option>
                    <option value="1">♂ Male</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Community Type</label>
                  <select className="form-input" name="communityType" value={formValues.communityType} onChange={handleChange}>
                    {COMMUNITY_TYPES.map((ct) => (
                      <option key={ct} value={ct}>{COMMUNITY_ICONS[ct]} {ct}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clinical data */}
              <div className="form-section-label">🩺 Clinical Measurements</div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">BMI</label>
                  <input className="form-input" type="number" name="bmi" value={formValues.bmi} onChange={handleChange} step="0.1" required placeholder="e.g. 22.5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Hemoglobin (g/dL)</label>
                  <input className="form-input" type="number" name="hemoglobin" value={formValues.hemoglobin} onChange={handleChange} step="0.1" required placeholder="e.g. 13.5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Hematocrit (%)</label>
                  <input className="form-input" type="number" name="hematocrit" value={formValues.hematocrit} onChange={handleChange} step="0.1" required placeholder="e.g. 42.0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Platelet Count</label>
                  <input className="form-input" type="number" name="plateletCount" value={formValues.plateletCount} onChange={handleChange} required placeholder="e.g. 250" />
                </div>
                <div className="form-group">
                  <label className="form-label">Systolic BP (mmHg)</label>
                  <input className="form-input" type="number" name="systolicBp" value={formValues.systolicBp} onChange={handleChange} required placeholder="e.g. 120" />
                </div>
                <div className="form-group">
                  <label className="form-label">Creatinine (mg/dL)</label>
                  <input className="form-input" type="number" name="creatinine" value={formValues.creatinine} onChange={handleChange} step="0.01" required placeholder="e.g. 0.90" />
                </div>
                <div className="form-group">
                  <label className="form-label">Albumin (g/dL)</label>
                  <input className="form-input" type="number" name="albumin" value={formValues.albumin} onChange={handleChange} step="0.1" required placeholder="e.g. 4.2" />
                </div>
                <div className="form-group">
                  <label className="form-label">Comorbidities (0–5)</label>
                  <input className="form-input" type="number" name="numComorbidities" value={formValues.numComorbidities} onChange={handleChange} min={0} max={5} required placeholder="0 – 5" />
                </div>
              </div>

              {/* SDoH */}
              <div className="form-section-label">🏘️ Social Determinants of Health</div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Median Income (USD)</label>
                  <input className="form-input" type="number" name="medianIncome" value={formValues.medianIncome} onChange={handleChange} required placeholder="e.g. 55000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Poverty Rate (%)</label>
                  <input className="form-input" type="number" name="povertyRate" value={formValues.povertyRate} onChange={handleChange} step="0.1" required placeholder="e.g. 12.5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Education Bachelor's (%)</label>
                  <input className="form-input" type="number" name="educationBachelorsPct" value={formValues.educationBachelorsPct} onChange={handleChange} step="0.1" required placeholder="e.g. 30.0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Unemployment Rate (%)</label>
                  <input className="form-input" type="number" name="unemploymentRate" value={formValues.unemploymentRate} onChange={handleChange} step="0.1" required placeholder="e.g. 5.2" />
                </div>
                <div className="form-group">
                  <label className="form-label">No Health Insurance (%)</label>
                  <input className="form-input" type="number" name="noHealthInsurancePct" value={formValues.noHealthInsurancePct} onChange={handleChange} step="0.1" required placeholder="e.g. 8.0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Disability Rate (%)</label>
                  <input className="form-input" type="number" name="disabilityRate" value={formValues.disabilityRate} onChange={handleChange} step="0.1" required placeholder="e.g. 14.0" />
                </div>
                <div className="form-group">
                  <label className="form-label">No Vehicle (%)</label>
                  <input className="form-input" type="number" name="noVehiclePct" value={formValues.noVehiclePct} onChange={handleChange} step="0.1" required placeholder="e.g. 6.5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Median Housing Cost (USD/mo)</label>
                  <input className="form-input" type="number" name="medianHousingCost" value={formValues.medianHousingCost} onChange={handleChange} required placeholder="e.g. 1200" />
                </div>
              </div>

              <button type="submit" className="form-submit-btn" disabled={saving}>
                {saving ? '⏳ Saving...' : '✓ Create Patient'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Stats Row ───────────────────────────────── */}
      {!loading && patients.length > 0 && (
        <div className="patients-stats-row">
          <div className="patients-stat-card">
            <div className="stat-icon-wrap purple">👥</div>
            <div>
              <div className="stat-info-label">Total Patients</div>
              <div className="stat-info-value">{patients.length}</div>
            </div>
          </div>
          <div className="patients-stat-card">
            <div className="stat-icon-wrap green">♂</div>
            <div>
              <div className="stat-info-label">Male Patients</div>
              <div className="stat-info-value">{maleCount}</div>
            </div>
          </div>
          <div className="patients-stat-card">
            <div className="stat-icon-wrap amber">♀</div>
            <div>
              <div className="stat-info-label">Female Patients</div>
              <div className="stat-info-value">{femaleCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Table Card ──────────────────────────────── */}
      <div className="patients-card">
        {/* Toolbar */}
        <div className="patients-toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="premium-search-input"
              placeholder="Search patients by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {!loading && (
            <div className="patients-count-badge">
              <span>📋</span>
              {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="patients-loading">
            <div className="loading-spinner" />
            <span>Loading patients...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="patients-empty-state">
            <div className="patients-empty-icon">
              {search ? '🔎' : '🏥'}
            </div>
            <div className="patients-empty-title">
              {search ? 'No results found' : 'No patients yet'}
            </div>
            <p className="patients-empty-sub">
              {search
                ? `No patients matching "${search}". Try a different name.`
                : 'Click "New Patient" to add the first patient record.'}
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Community</th>
                  <th>Comorbidities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id || p._id}>
                    <td>
                      <div className="patient-name-cell">
                        <div className="patient-avatar-circle">
                          {getInitials(p.name)}
                        </div>
                        <span className="patient-name-text">{p.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="age-chip">🎂 {p.age} yrs</span>
                    </td>
                    <td>
                      <span className={`gender-badge ${p.gender === 0 ? 'female' : 'male'}`}>
                        {p.gender === 0 ? '♀ Female' : '♂ Male'}
                      </span>
                    </td>
                    <td>
                      <span className="community-badge">
                        {COMMUNITY_ICONS[p.communityType] || '📍'} {p.communityType}
                      </span>
                    </td>
                    <td>
                      <ComorbidityDots count={p.numComorbidities ?? 0} />
                    </td>
                    <td>
                      <button
                        className="btn-danger-premium"
                        onClick={() => handleDelete(p.id || p._id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="patients-pagination">
            <button
              className="pagination-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Prev
            </button>
            <span className="pagination-label">Page {page + 1} of {totalPages}</span>
            <button
              className="pagination-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
