 import { useState, useEffect } from 'react';
import api from '../lib/axios';
import type { Project } from '../types/index';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Project[]>('/projects')
      .then(res => setProjects(res.data))
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 4px' }}>Projects</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Manage and track your projects</p>
        </div>
        {/* Tharushan: place <CreateProjectButton /> here */}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading projects...</div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#2d1515', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {projects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#6b7280', background: '#111111', borderRadius: '12px', border: '1px solid #1f1f1f' }}>
              <p style={{ fontSize: '16px', margin: '0 0 8px', color: 'white' }}>No projects yet</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Backend not connected yet.</p>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px', cursor: 'pointer' }}
                onClick={() => window.location.href = `/projects/${project.id}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: '600', margin: 0, fontSize: '15px' }}>{project.name}</p>
                  </div>
                </div>
                {project.description && (
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.5' }}>
                    {project.description}
                  </p>
                )}
                <p style={{ color: '#374151', fontSize: '12px', margin: 0 }}>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tharushan: place <ProjectDetailModal /> here */}
    </div>
  );
}