import { useState, useEffect } from 'react';
import api from '../lib/axios';
import type { User } from '../types/index';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<User[]>('/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const getRoleBadgeColor = (role: string) => {
    if (role === 'Admin') return { background: '#4c1d95', color: '#c4b5fd' };
    if (role === 'ProjectManager') return { background: '#1e3a5f', color: '#93c5fd' };
    return { background: '#1a2e1a', color: '#86efac' };
  };

  const getStatusColor = (status: string) => {
    if (status === 'Active') return { background: '#1a2e1a', color: '#86efac' };
    return { background: '#2d1515', color: '#fca5a5' };
  };

  return (
    <div style={{ padding: '24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 0 6px' }}>
          Users
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Manage all system users
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading users...</div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#2d1515', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f1f1f' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                    No users found. Backend not connected yet.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} style={{ borderBottom: index < users.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600', flexShrink: 0 }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '14px' }}>{user.email}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ ...getRoleBadgeColor(user.role), padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ ...getStatusColor(user.status), padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tharushan: place <UserSearch /> and <UserFilter /> here */}
      {/* Tharushan: place <CreateUserModal /> here */}
    </div>
  );
}
