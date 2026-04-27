import { AlertTriangle, TrendingUp, Clock } from 'lucide-react'

const alerts = [
  {
    severity: 'high',
    title: 'Deepfake detected in viral penalty clip',
    description: 'A heavily manipulated video claiming to show an incorrectly awarded penalty is circulating across social platforms. AI confidence: 94%.',
    time: '12 minutes ago',
    source: 'X (Twitter)',
  },
  {
    severity: 'high',
    title: 'Fabricated transfer announcement screenshot',
    description: 'Fake screenshot mimicking official club announcement about a star player transfer. Metadata analysis reveals Photoshop artifacts.',
    time: '1 hour ago',
    source: 'Instagram',
  },
  {
    severity: 'medium',
    title: 'Suspicious slow-motion goal replay',
    description: 'Video appears to have spliced frames from two different matches. Source verification inconclusive.',
    time: '3 hours ago',
    source: 'YouTube',
  },
  {
    severity: 'medium',
    title: 'Altered referee decision graphic',
    description: 'Stats overlay graphic has been modified to show incorrect VAR decision data. Original source identified.',
    time: '5 hours ago',
    source: 'Reddit',
  },
  {
    severity: 'low',
    title: 'Reposted match highlights with misleading caption',
    description: 'Old match footage being shared as current season content. Content verified as authentic but context is misleading.',
    time: '8 hours ago',
    source: 'TikTok',
  },
  {
    severity: 'low',
    title: 'Fan-edited celebration montage flagged',
    description: 'User-generated edit contains watermark removal from official broadcaster content. Ownership violation detected.',
    time: '12 hours ago',
    source: 'X (Twitter)',
  },
]

const trending = [
  { title: 'Premier League VAR controversy clips', count: '2.4K shares', risk: 'High' },
  { title: 'Champions League draw prediction leaks', count: '1.8K shares', risk: 'Medium' },
  { title: 'World Cup qualification fake lineups', count: '950 shares', risk: 'High' },
]

export default function AlertsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Alerts</h1>
        <p className="page-subtitle">Live feed of suspicious and trending sports media</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Main Feed */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
            Suspicious Content Feed
          </h3>
          {alerts.map((alert, i) => (
            <div key={i} className="alert-card">
              <div className={`alert-card-indicator ${alert.severity}`} />
              <div className="alert-card-content">
                <h4>{alert.title}</h4>
                <p>{alert.description}</p>
                <div className="alert-card-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {alert.time}
                  </span>
                  <span>Source: {alert.source}</span>
                  <span className={`badge badge-${alert.severity === 'high' ? 'fake' : alert.severity === 'medium' ? 'suspicious' : 'info'}`}>
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Risk
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Sidebar */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: 'var(--warning)' }} />
            Trending Fake Media
          </h3>
          {trending.map((item, i) => (
            <div key={i} className="card" style={{ marginBottom: 12, padding: '16px 20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>{item.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.count}</span>
                <span className={`badge ${item.risk === 'High' ? 'badge-fake' : 'badge-suspicious'}`}>{item.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
