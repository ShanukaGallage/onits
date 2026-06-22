import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-ip-surface font-jakarta">

      {/* Fixed Left Sidebar */}
      <div className="w-64 flex-shrink-0 h-screen bg-ip-surface border-r border-ip-outline-variant flex flex-col">
        <Sidebar />
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Header */}
        <div className="h-16 flex-shrink-0 border-b border-ip-outline-variant bg-ip-surface/80 backdrop-blur-md">
          <Header />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-ip-surface p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}