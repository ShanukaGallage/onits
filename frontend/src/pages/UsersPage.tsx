import { useState } from 'react';
import CreateUserModal from '@/features/users/components/CreateUserModal';
import UserTable from '@/features/users/components/UserTable';
import { useUsers } from '@/features/users/hooks/useUsers';

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: users } = useUsers();

  const totalUsers = users?.length || 0;
  const activeNow = users?.filter(u => u.status === 'Active').length || 0;

  return (
    <div className="bg-background text-on-surface font-body-md w-full max-w-[1600px] flex flex-col gap-lg">
      {/* Page Header & Global Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">User Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage platform access, roles, and administrative privileges.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-sm bg-primary text-on-primary px-md py-sm rounded-lg hover:bg-on-primary-fixed-variant transition-colors font-body-md text-body-md font-medium shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Add New User
        </button>
      </div>

      {/* Stats/Filters Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-card-gap">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant">TOTAL USERS</span>
          <div className="flex items-baseline gap-sm mt-sm">
            <span className="font-display text-display text-on-surface">{totalUsers}</span>
            <span className="text-primary text-body-sm font-medium flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> 12%</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant">ACTIVE NOW</span>
          <div className="flex items-baseline gap-sm mt-sm">
            <span className="font-display text-display text-on-surface">{activeNow}</span>
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
          </div>
        </div>
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center justify-between gap-md">
          <div className="flex gap-sm">
            <button className="px-md py-xs rounded-full border border-primary bg-primary-container text-on-primary font-label-caps text-label-caps transition-colors">All Roles</button>
            <button className="px-md py-xs rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-caps text-label-caps transition-colors">Admin</button>
            <button className="px-md py-xs rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-caps text-label-caps transition-colors">PM</button>
            <button className="px-md py-xs rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-caps text-label-caps transition-colors">Engineer</button>
          </div>
          <div className="flex items-center gap-sm text-on-surface-variant">
            <span className="material-symbols-outlined">filter_list</span>
            <span className="font-body-sm text-body-sm">More Filters</span>
          </div>
        </div>
      </div>

      <UserTable />
      <CreateUserModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
