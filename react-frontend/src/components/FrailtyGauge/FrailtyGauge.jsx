import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import './FrailtyGauge.css'

const SCORE_COLORS = ['#34a853', '#81c995', '#fbbc04', '#ff8c00', '#ea4335', '#b31412']
const SCORE_LABELS = ['Very Low', 'Low', 'Mild', 'Moderate', 'High', 'Very High']

function getScoreColor(score) {
  return SCORE_COLORS[Math.min(score, 5)]
}

function getScoreLabel(score) {
  return SCORE_LABELS[Math.min(score, 5)]
}

export default function FrailtyGauge({ frailtyScore, isFrail, probability }) {
  const score = Math.min(Math.max(frailtyScore, 0), 5)
  const color = getScoreColor(score)
  const label = getScoreLabel(score)
  const pct = Math.round(probability * 100)

  const data = [{ name: 'score', value: (score / 5) * 100, fill: color }]

  return (
    <div className="frailty-gauge card">
      <div className="card-title">Frailty Risk Score</div>
      <div className="gauge-container">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart
            cx="50%"
            cy="75%"
            innerRadius="60%"
            outerRadius="90%"
            barSize={18}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: '#e8eaf0' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="gauge-center">
          <span className="gauge-score" style={{ color }}>{score}</span>
          <span className="gauge-max">/5</span>
        </div>
      </div>

      <div className="gauge-info">
        <div className="gauge-risk-label" style={{ color }}>{label} Risk</div>
        <div className={`badge ${isFrail ? 'badge-frail' : 'badge-not-frail'} gauge-frail-badge`}>
          {isFrail ? 'Frail' : 'Not Frail'}
        </div>
        <div className="gauge-probability">
          Frailty probability: <strong>{pct}%</strong>
        </div>
      </div>

      <div className="gauge-scale">
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`gauge-scale-dot${s === score ? ' active' : ''}`}
            style={{ background: s === score ? SCORE_COLORS[s] : '#e0e6ed' }}
            title={`Score ${s}: ${SCORE_LABELS[s]}`}
          />
        ))}
      </div>
    </div>
  )
}
