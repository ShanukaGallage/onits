import { useEffect, useState } from 'react';
import { useUsers, useDeactivateUser, useReactivateUser, useDeleteUser } from '../hooks/useUsers';
import EditUserModal from './EditUserModal';
import type { User, Role, UserStatus } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl, getInitials } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserX } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleUI(role: Role) {
  switch (role) {
    case 'Admin':
      return {
        containerClass: 'bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]',
        icon: 'shield_person',
        label: 'ADMIN',
      };
    case 'ProjectManager':
      return {
        containerClass: 'bg-secondary-container text-on-secondary-container border border-outline-variant',
        icon: 'architecture',
        label: 'PROJECT MANAGER',
      };
    case 'Collaborator':
    default:
      return {
        containerClass: 'bg-surface-variant text-on-surface-variant border border-outline-variant',
        icon: 'person',
        label: 'COLLABORATOR',
      };
  }
}

function getStatusUI(status: UserStatus) {
  switch (status) {
    case 'Active':
      return {
        containerClass: 'bg-[#ecfdf5] text-[#065f46]',
        dotClass: 'bg-[#10b981]',
        label: 'ACTIVE',
      };
    case 'Deactivated':
    default:
      return {
        containerClass: 'bg-surface-variant text-on-surface-variant',
        dotClass: 'bg-outline',
        label: 'OFFLINE',
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface UserTableProps {
  roleFilter?: Role | 'All';
}

export default function UserTable({ roleFilter = 'All' }: UserTableProps) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<'deactivate' | 'reactivate' | 'delete'>('deactivate');

  // 300 ms debounce
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: allUsers, isLoading, isError } = useUsers(debouncedSearch || undefined);
  
  const users = allUsers?.filter((user) => {
    if (roleFilter !== 'All' && user.role !== roleFilter) return false;
    return true;
  });

  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();

  const remove = useDeleteUser();

  const isPending = deactivate.isPending || reactivate.isPending || remove.isPending;

  function openConfirm(user: User, action: 'deactivate' | 'reactivate' | 'delete') {
    setConfirmUser(user);
    setConfirmAction(action);
  }

  function handleConfirm() {
    if (!confirmUser) return;
    const mutation = 
      confirmAction === 'deactivate' ? deactivate : 
      confirmAction === 'reactivate' ? reactivate : 
      remove;

    mutation.mutate(confirmUser.id, {
      onSuccess: () => setConfirmUser(null),
    });
  }

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-md space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-outline-variant rounded-xl text-center gap-3">
        <UserX className="w-10 h-10 text-error" />
        <p className="text-body-lg font-medium text-error">Failed to load users</p>
        <p className="text-body-sm text-on-surface-variant">
          Something went wrong while fetching the user list. Please try again.
        </p>
      </div>
    );
  }

  const totalUsers = users?.length || 0;

  // ─── Table ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative w-full max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input 
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md text-body-md shadow-sm" 
          placeholder="Search users..." 
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Users Data Table (Card Style) */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-md p-md border-b border-outline-variant bg-surface-container-low items-center">
          <div className="w-10"></div> {/* Avatar spacer */}
          <span className="font-label-caps text-label-caps text-on-surface-variant">USER DETAILS</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">ROLE & DEPARTMENT</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">STATUS</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant text-right">ACTIONS</span>
        </div>

        {/* List Items */}
        <div className="flex flex-col">
          {!users || users.length === 0 ? (
            <div className="p-12 text-center text-body-md text-on-surface-variant">
              No users found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.
            </div>
          ) : (
            users.map((user) => {
              const roleUI = getRoleUI(user.role);
              const statusUI = getStatusUI(user.status);

              return (
                <div key={user.id} className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr_auto] gap-md p-md border-b border-outline-variant hover:bg-surface-container transition-colors items-center group last:border-b-0">
                  <Avatar className="w-10 h-10 border-2 border-surface flex-shrink-0">
                    <AvatarImage src={getAvatarUrl(user.avatarUrl)} alt={user.name} className="object-cover" />
                    <AvatarFallback className="bg-primary-container text-on-primary font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-body-lg font-medium text-on-surface">{user.name}</h4>
                    <span className="font-label-code text-label-code text-on-surface-variant">{user.email}</span>
                  </div>
                  <div>
                    <div className={`inline-flex items-center gap-xs px-2 py-1 rounded ${roleUI.containerClass}`}>
                      <span className="material-symbols-outlined text-[14px]">{roleUI.icon}</span>
                      <span className="font-label-caps text-label-caps">{roleUI.label}</span>
                    </div>
                    <span className="block text-body-sm text-on-surface-variant mt-xs">Department</span>
                  </div>
                  <div>
                    <div className={`inline-flex items-center gap-xs px-2 py-1 rounded ${statusUI.containerClass}`}>
                      <span className={`w-2 h-2 rounded-full ${statusUI.dotClass}`}></span>
                      <span className="font-label-caps text-label-caps">{statusUI.label}</span>
                    </div>
                    <span className="block text-body-sm text-on-surface-variant mt-xs">Last login: N/A</span>
                  </div>
                  <div className="flex justify-end gap-xs opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditUser(user)}
                      className="p-2 rounded hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors" 
                      title="Edit User"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    {user.status === 'Deactivated' ? (
                      <button 
                        onClick={() => openConfirm(user, 'reactivate')}
                        className="p-2 rounded hover:bg-surface-variant text-on-surface-variant hover:text-[#10b981] transition-colors" 
                        title="Reactivate"
                      >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => openConfirm(user, 'deactivate')}
                        className="p-2 rounded hover:bg-surface-variant text-on-surface-variant hover:text-error transition-colors" 
                        title="Deactivate"
                      >
                        <span className="material-symbols-outlined text-lg">block</span>
                      </button>
                    )}
                    <button 
                      onClick={() => openConfirm(user, 'delete')}
                      className="p-2 rounded hover:bg-surface-variant text-on-surface-variant hover:text-error transition-colors" 
                      title="Remove User"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {users && users.length > 0 && (
          <div className="p-md flex items-center justify-between bg-surface-container-lowest">
            <span className="text-body-sm text-on-surface-variant">Showing 1 to {totalUsers} of {totalUsers} users</span>
            <div className="flex gap-xs">
              <button className="px-sm py-xs border border-outline-variant rounded hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50" disabled>Prev</button>
              <button className="px-sm py-xs border border-primary bg-primary text-on-primary rounded">1</button>
              <button className="px-sm py-xs border border-outline-variant rounded hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmUser !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'deactivate' ? 'Deactivate user?' : 
               confirmAction === 'reactivate' ? 'Reactivate user?' : 
               'Permanently delete user?'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'deactivate' ? (
                <>
                  This will deactivate{' '}
                  <span className="font-semibold text-foreground">{confirmUser?.name}</span>{' '}
                  ({confirmUser?.email}). They will no longer be able to sign in.
                </>
              ) : confirmAction === 'reactivate' ? (
                <>
                  This will reactivate{' '}
                  <span className="font-semibold text-foreground">{confirmUser?.name}</span>{' '}
                  ({confirmUser?.email}). They will be able to sign in again.
                </>
              ) : (
                <>
                  This will permanently delete{' '}
                  <span className="font-semibold text-foreground">{confirmUser?.name}</span>{' '}
                  ({confirmUser?.email}) and all data they created. This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmUser(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              id="confirm-status-btn"
              variant={confirmAction === 'reactivate' ? 'default' : 'destructive'}
              className={confirmAction === 'reactivate' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? 'Confirming...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
    </div>
  );
}
