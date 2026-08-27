import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';


const routeTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/my-tasks':  'My Tasks',
  '/inbox':     'Inbox',
  '/profile':   'Profile',
  '/projects':  'Manage Projects',
  '/users':     'Manage Users',
};

export default function AppLayout() {
  const [isOpen, setIsOpen] = useState(true);
  
  const location = useLocation();

  let pageTitle = routeTitles[location.pathname] ?? 'Dashboard';
  if (location.pathname.startsWith('/projects/')) pageTitle = 'Project Details';

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-background p-0 md:p-4 font-sans text-foreground">
      
      <div className="relative w-full h-full max-w-[1600px] bg-card md:rounded-xl border-0 md:border border-border/50 flex overflow-hidden shadow-sm md:ring-1 ring-black/5 dark:ring-white/5">
        
        {/* Sidebar Panel */}
        <div 
          className={`h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-card/50 border-r border-border/50 ${
            isOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 border-none'
          }`}
        >
          <Sidebar className="w-[260px] border-none bg-transparent" />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col min-w-0 transition-all duration-300">
           
           {/* Top Header Row */}
           <div className="h-14 border-b border-border/50 flex items-center px-4 justify-between bg-card shrink-0">
             
             {/* Left Header items */}
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsOpen(!isOpen)}
                 className="p-1.5 rounded-md text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors"
               >
                 {isOpen ? <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />}
               </button>
               <div className="flex items-center gap-2 text-sm text-muted-foreground hidden sm:flex">
                 <span className="truncate">OnIts Workspace</span>
                 <span>/</span>
                 <span className="font-medium text-foreground truncate">{pageTitle}</span>
               </div>
             </div>
             
             {/* Right Header items (Existing Header Component) */}
             <div className="flex-1 flex justify-end h-full py-1">
               <Header />
             </div>
             
           </div>

           {/* Scrollable Content View */}
           <main className="flex-1 p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
             <Outlet />
           </main>
        </div>
      </div>
    </div>
  );
}