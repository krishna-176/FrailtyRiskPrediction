import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer,
} from 'recharts'
import './ShapChart.css'

function formatFeatureName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function ShapChart({ shapValues }) {
  const entries = Object.entries(shapValues)
    .map(([feature, value]) => ({ feature: formatFeatureName(feature), rawFeature: feature, value }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 10)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { value, rawFeature } = payload[0].payload
      return (
        <div className="shap-tooltip">
          <div className="shap-tooltip-feature">{rawFeature}</div>
          <div className="shap-tooltip-value" style={{ color: value > 0 ? '#ea4335' : '#1a73e8' }}>
            SHAP: {value.toFixed(4)}
          </div>
          <div className="shap-tooltip-direction">
            {value > 0 ? '↑ Increases frailty risk' : '↓ Decreases frailty risk'}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="shap-chart card">
      <div className="card-title">SHAP Feature Importance</div>
      <div className="shap-legend">
        <span className="shap-legend-item shap-legend-increase">▲ Increases Risk</span>
        <span className="shap-legend-item shap-legend-decrease">▼ Decreases Risk</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={entries}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            dataKey="feature"
            type="category"
            width={160}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#666" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {entries.map((entry) => (
              <Cell
                key={entry.rawFeature}
                fill={entry.value > 0 ? '#ea4335' : '#1a73e8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
