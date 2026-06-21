import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import CreateUserModal from '@/features/users/components/CreateUserModal';
import UserTable from '@/features/users/components/UserTable';

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="font-jakarta space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-ip-on-surface tracking-tight">User Manage</h1>
          <p className="text-sm text-ip-on-surface-variant mt-1">Add, deactivate and manage system users.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-ip-base bg-ip-primary text-ip-on-primary text-sm font-semibold shadow-[0_2px_8px_rgba(70,72,212,0.25)] hover:bg-ip-on-primary-fixed-variant hover:shadow-[0_4px_16px_rgba(70,72,212,0.35)] transition-all"
        >
          <UserPlus size={15} />
          Add User
        </button>
      </div>

      <UserTable />
      <CreateUserModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
