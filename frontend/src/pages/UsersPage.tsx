import { useState } from 'react';
import CreateUserModal from '@/features/users/components/CreateUserModal';
import UserTable from '@/features/users/components/UserTable';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
          <p className="text-sm text-gray-400">Manage all system users</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>Add User</Button>
      </div>

      {/* Main Table Component */}
      <UserTable />

      {/* Creation Modal */}
      <CreateUserModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
