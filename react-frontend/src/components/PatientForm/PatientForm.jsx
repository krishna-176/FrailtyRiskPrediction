import { useState } from 'react'
import './PatientForm.css'

const COMMUNITY_TYPES = ['Urban', 'Suburban', 'Small Town', 'Rural', 'Frontier']

const CLINICAL_FIELDS = [
  { name: 'age', label: 'Age (years)', type: 'number', min: 50, max: 90, step: 1, placeholder: '65' },
  { name: 'gender', label: 'Gender (0=Female, 1=Male)', type: 'number', min: 0, max: 1, step: 1, placeholder: '0' },
  { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 80, step: 0.1, placeholder: '25.0' },
  { name: 'hemoglobin', label: 'Hemoglobin (g/dL)', type: 'number', min: 5, max: 20, step: 0.1, placeholder: '13.0' },
  { name: 'hematocrit', label: 'Hematocrit (%)', type: 'number', min: 10, max: 60, step: 0.1, placeholder: '40.0' },
  { name: 'platelet_count', label: 'Platelet Count (10³/µL)', type: 'number', min: 20, max: 800, step: 1, placeholder: '250' },
  { name: 'num_comorbidities', label: 'Comorbidities (0-5)', type: 'number', min: 0, max: 5, step: 1, placeholder: '1' },
  { name: 'systolic_bp', label: 'Systolic BP (mmHg)', type: 'number', min: 70, max: 250, step: 1, placeholder: '120' },
  { name: 'creatinine', label: 'Creatinine (mg/dL)', type: 'number', min: 0.3, max: 10, step: 0.01, placeholder: '1.0' },
  { name: 'albumin', label: 'Albumin (g/dL)', type: 'number', min: 1.5, max: 6, step: 0.1, placeholder: '4.0' },
]

const SDOH_FIELDS = [
  { name: 'median_income', label: 'Median Income (USD)', type: 'number', min: 0, step: 1, placeholder: '50000' },
  { name: 'poverty_rate', label: 'Poverty Rate (%)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: '12.0' },
  { name: 'education_bachelors_pct', label: "Bachelor's Degree (%)", type: 'number', min: 0, max: 100, step: 0.1, placeholder: '25.0' },
  { name: 'unemployment_rate', label: 'Unemployment Rate (%)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: '5.0' },
  { name: 'no_health_insurance_pct', label: 'No Health Insurance (%)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: '10.0' },
  { name: 'disability_rate', label: 'Disability Rate (%)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: '12.0' },
  { name: 'no_vehicle_pct', label: 'No Vehicle (%)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: '8.0' },
  { name: 'median_housing_cost', label: 'Median Housing Cost (USD/mo)', type: 'number', min: 0, step: 1, placeholder: '900' },
]

const DEFAULT_VALUES = {
  age: '', gender: '', bmi: '', hemoglobin: '', hematocrit: '',
  platelet_count: '', num_comorbidities: '', systolic_bp: '', creatinine: '', albumin: '',
  community_type: 'Urban',
  median_income: '', poverty_rate: '', education_bachelors_pct: '',
  unemployment_rate: '', no_health_insurance_pct: '', disability_rate: '',
  no_vehicle_pct: '', median_housing_cost: '',
}

export default function PatientForm({ onSubmit, loading }) {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    const numFields = [...CLINICAL_FIELDS, ...SDOH_FIELDS]
    numFields.forEach(({ name, min, max }) => {
      const v = parseFloat(values[name])
      if (values[name] === '' || isNaN(v)) {
        errs[name] = 'Required'
      } else if (min !== undefined && v < min) {
        errs[name] = `Min: ${min}`
      } else if (max !== undefined && v > max) {
        errs[name] = `Max: ${max}`
      }
    })
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const payload = {}
    CLINICAL_FIELDS.forEach(({ name }) => { payload[name] = parseFloat(values[name]) })
    SDOH_FIELDS.forEach(({ name }) => { payload[name] = parseFloat(values[name]) })
    payload.community_type = values.community_type
    onSubmit(payload)
  }

  const renderField = (field) => (
    <div key={field.name} className="form-group">
      <label className="form-label">{field.label}</label>
      <input
        className={`form-input${errors[field.name] ? ' error' : ''}`}
        type={field.type}
        name={field.name}
        value={values[field.name]}
        onChange={handleChange}
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
      />
      {errors[field.name] && <span className="form-error">{errors[field.name]}</span>}
    </div>
  )

  return (
    <form className="patient-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="form-section-title">Clinical Features</h3>
        <div className="grid-2">{CLINICAL_FIELDS.map(renderField)}</div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Social Determinants of Health</h3>
        <div className="form-group">
          <label className="form-label">Community Type</label>
          <select
            className="form-input"
            name="community_type"
            value={values.community_type}
            onChange={handleChange}
          >
            {COMMUNITY_TYPES.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
        <div className="grid-2">{SDOH_FIELDS.map(renderField)}</div>
      </div>

      <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading}>
        {loading ? 'Predicting...' : '🔬 Predict Frailty Risk'}
      </button>
    </form>
  )
}
