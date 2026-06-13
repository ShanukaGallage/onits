import ProjectList from '../features/projects/components/ProjectList';

export default function ProjectsPage() {
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

      <ProjectList />

      {/* Tharushan: place <ProjectDetailModal /> here */}
    </div>
  );
}