 import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 4px' }}>
          Welcome back, {user?.name ?? 'User'} 👋
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Projects', value: '—', color: '#6366f1' },
          { label: 'Active Tasks', value: '—', color: '#8b5cf6' },
          { label: 'Completed', value: '—', color: '#10b981' },
          { label: 'Team Members', value: '—', color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px' }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px', fontWeight: '500' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontSize: '28px', fontWeight: '700', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tharushan: place <DashboardStats /> here to replace stat cards above */}
      {/* Tharushan: place <RecentTasks /> here */}
      {/* Tharushan: place <ProjectOverview /> here */}
    </div>
  );
}