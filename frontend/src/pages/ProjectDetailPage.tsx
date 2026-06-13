import { useParams } from 'react-router-dom';
import ProjectDetail from '@/features/projects/components/ProjectDetail';

export default function ProjectDetailPage() {
  const { projectId } = useParams();

  if (!projectId) {
    return <div>Project not found</div>;
  }

  return <ProjectDetail projectId={projectId} />;
}