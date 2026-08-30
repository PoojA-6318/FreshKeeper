import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { analyticsAPI } from '../services/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import './Analytics.css';

const PIE_COLORS = ['#3D7A4F', '#DC2626'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, monRes] = await Promise.allSettled([
          analyticsAPI.summary(),
          analyticsAPI.monthly(),
        ]);
        if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
        if (monRes.status === 'fulfilled') setMonthly(monRes.value.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Loading message="Loading analytics..." />;

  const pieData = summary ? [
    { name: 'Consumed', value: summary.total_consumed || 0 },
    { name: 'Discarded', value: summary.total_discarded || 0 },
  ] : [];

  const hasPieData = pieData.some(d => d.value > 0);
  const hasMonthly = monthly.length > 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="analytics-tooltip">
        <p className="analytics-tooltip-label">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color, margin: '0.25rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Analytics</h1>
          <p className="page-subtitle">Track your food consumption and waste over time</p>
        </div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="analytics-summary">
          {[
            { label: 'Total Consumed', value: summary.total_consumed || 0, emoji: '🍽️', color: '#16A34A', bg: '#DCFCE7' },
            { label: 'Total Discarded', value: summary.total_discarded || 0, emoji: '🗑️', color: '#DC2626', bg: '#FEE2E2' },
            { label: 'Waste Rate', value: `${summary.waste_rate || 0}%`, emoji: '📉', color: '#CA8A04', bg: '#FEF9C3' },
            { label: 'Items Tracked', value: summary.total_tracked || 0, emoji: '📦', color: '#3B82F6', bg: '#EFF6FF' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: '1.375rem' }}>
                {s.emoji}
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="analytics-charts">
        {/* Bar chart — Monthly */}
        <div className="card card-padding analytics-chart-card">
          <h3 className="analytics-chart-title">Monthly Consumption vs Waste</h3>
          {!hasMonthly ? (
            <div className="analytics-empty">
              <p>📊 No monthly data yet. Start tracking food to see trends.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} margin={{ top: 8, right: 16, left: -8, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontFamily: 'var(--font-display)', fontSize: 12, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: 'var(--font-display)', fontSize: 11, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem', paddingTop: '1rem' }}
                />
                <Bar dataKey="consumed" name="Consumed" fill="#3D7A4F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discarded" name="Discarded" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card card-padding analytics-chart-card">
          <h3 className="analytics-chart-title">Consumed vs Discarded</h3>
          {!hasPieData ? (
            <div className="analytics-empty">
              <p>🍽️ Mark items as consumed or discarded to see breakdown.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem', paddingTop: '1rem' }}
                />
                <Tooltip
                  formatter={(val, name) => [`${val} items`, name]}
                  contentStyle={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Waste tip */}
      <div className="analytics-tip">
        <span className="analytics-tip-icon">💡</span>
        <div>
          <p className="analytics-tip-title">Reduce food waste</p>
          <p className="analytics-tip-desc">
            Use the Expiring Soon filter in inventory to consume or plan meals around food before it expires.
          </p>
        </div>
      </div>
    </div>
  );
}
