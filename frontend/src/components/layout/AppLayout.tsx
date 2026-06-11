 import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">

      {/* Fixed Left Sidebar — width 64 = 256px */}
      <div className="w-64 flex-shrink-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
        <Sidebar />
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Header — height 16 = 64px */}
        <div className="h-16 flex-shrink-0 border-b border-slate-800 bg-slate-900">
          <Header />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}