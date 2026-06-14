import { useEffect, useState } from 'react';
import { useUsers, useDeactivateUser, useReactivateUser } from '../hooks/useUsers';
import type { User, Role, UserStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, UserX } from 'lucide-react';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const roleBadgeClass: Record<Role, string> = {
  Admin: 'bg-blue-100 text-blue-700 border-blue-200',
  ProjectManager: 'bg-green-100 text-green-700 border-green-200',
  Collaborator: 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusBadgeClass: Record<UserStatus, string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  Deactivated: 'bg-red-100 text-red-600 border-red-200',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserTable() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<'deactivate' | 'reactivate'>('deactivate');

  // 300 ms debounce
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: users, isLoading, isError } = useUsers(debouncedSearch || undefined);
  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();

  const isPending = deactivate.isPending || reactivate.isPending;

  function openConfirm(user: User, action: 'deactivate' | 'reactivate') {
    setConfirmUser(user);
    setConfirmAction(action);
  }

  function handleConfirm() {
    if (!confirmUser) return;
    const mutation = confirmAction === 'deactivate' ? deactivate : reactivate;
    mutation.mutate(confirmUser.id, {
      onSuccess: () => setConfirmUser(null),
    });
  }

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-9 w-64" />
        <div className="rounded-lg border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b last:border-b-0">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <UserX className="w-10 h-10 text-red-400" />
        <p className="text-sm font-medium text-red-600">Failed to load users</p>
        <p className="text-xs text-gray-400">
          Something went wrong while fetching the user list. Please try again.
        </p>
      </div>
    );
  }

  // ─── Table ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="user-search"
          type="search"
          placeholder="Search users…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!users || users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No users found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleBadgeClass[user.role]}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass[user.status]}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.status === 'Deactivated' ? (
                      <Button
                        id={`reactivate-${user.id}`}
                        variant="outline"
                        size="sm"
                        className="border-emerald-600 text-emerald-500 hover:bg-emerald-950 hover:text-emerald-400"
                        onClick={() => openConfirm(user, 'reactivate')}
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        id={`deactivate-${user.id}`}
                        variant="destructive"
                        size="sm"
                        onClick={() => openConfirm(user, 'deactivate')}
                      >
                        Deactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
              {confirmAction === 'deactivate' ? 'Deactivate user?' : 'Reactivate user?'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'deactivate' ? (
                <>
                  This will deactivate{' '}
                  <span className="font-semibold text-foreground">{confirmUser?.name}</span>{' '}
                  ({confirmUser?.email}). They will no longer be able to sign in.
                </>
              ) : (
                <>
                  This will reactivate{' '}
                  <span className="font-semibold text-foreground">{confirmUser?.name}</span>{' '}
                  ({confirmUser?.email}). They will be able to sign in again.
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
              variant={confirmAction === 'deactivate' ? 'destructive' : 'default'}
              className={confirmAction === 'reactivate' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending
                ? confirmAction === 'deactivate' ? 'Deactivating…' : 'Activating…'
                : confirmAction === 'deactivate' ? 'Yes, deactivate' : 'Yes, activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
