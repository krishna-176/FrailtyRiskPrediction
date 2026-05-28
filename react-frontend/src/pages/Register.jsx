import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', username: '', email: '',
    password: '', confirmPassword: '',
    patientId: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!form.username.trim() || form.username.length < 3) errs.username = 'Username must be at least 3 characters'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email is required'
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.patientId.trim()) errs.patientId = 'Patient ID is required — ask your doctor for this'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { confirmPassword: _cp, ...payload } = form
      await register(payload)
      navigate('/my-profile')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">
          <span className="auth-brand-icon">🏥</span>
          <span className="auth-brand-name">Frailty AI</span>
        </div>
        <h2 className="auth-title">Patient Registration</h2>
        <p className="auth-subtitle">Create your patient account</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Patient ID — first and most important */}
          <div className="form-group">
            <label className="form-label" htmlFor="patientId">
              Patient ID <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="patientId"
              name="patientId"
              type="text"
              className={`form-input${errors.patientId ? ' error' : ''}`}
              placeholder="Enter the Patient ID given by your doctor"
              value={form.patientId}
              onChange={handleChange}
            />
            {errors.patientId
              ? <span className="form-error">{errors.patientId}</span>
              : <small style={{ color: 'var(--color-text-secondary, #9ca3af)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                  Your doctor creates a patient record and gives you this ID.
                </small>
            }
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className={`form-input${errors.name ? ' error' : ''}`}
              placeholder="Your full name" value={form.name} onChange={handleChange} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input id="username" name="username" type="text" className={`form-input${errors.username ? ' error' : ''}`}
              placeholder="Choose a username" value={form.username} onChange={handleChange} autoComplete="username" />
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="At least 6 characters" value={form.password} onChange={handleChange} autoComplete="new-password" />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password"
                className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Patient Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
