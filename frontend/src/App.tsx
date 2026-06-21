 import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import RoleRoute from '@/components/layout/RoleRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MyTasksPage from '@/pages/MyTasksPage';
import InboxPage from '@/pages/InboxPage';
import ProfilePage from '@/pages/ProfilePage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import UsersPage from '@/pages/UsersPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForcePasswordResetPage from '@/pages/ForcePasswordResetPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/force-password-reset" element={<ForcePasswordResetPage />} />

          <Route element={<AppLayout />}>
            {/* All roles */}
            <Route path="/dashboard"          element={<DashboardPage />} />
            <Route path="/my-tasks"            element={<MyTasksPage />} />
            <Route path="/inbox"               element={<InboxPage />} />
            <Route path="/profile"             element={<ProfilePage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

            {/* PM + Admin */}
            <Route element={<RoleRoute allowedRoles={['Admin', 'ProjectManager']} />}>
              <Route path="/projects" element={<ProjectsPage />} />
            </Route>

            {/* Admin only */}
            <Route element={<RoleRoute allowedRoles={['Admin']} />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}