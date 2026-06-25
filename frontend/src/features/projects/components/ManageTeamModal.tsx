import { useState } from 'react';
import { toast } from 'sonner';
import { useAddMember, useRemoveMember } from '../hooks/useProjects';
import { useUsers } from '@/features/users/hooks/useUsers';
import type { Project } from '@/types';
import { X, Users, ChevronsUpDown, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

interface ManageTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onMutate: () => void;
}

export default function ManageTeamModal({ open, onOpenChange, project, onMutate }: ManageTeamModalProps) {
  const { data: users } = useUsers();
  const { user: currentUser } = useAuth();
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  const currentMemberIds = project.members?.map(m => m.userId) || [];
  const availableUsers = users?.filter(u => !currentMemberIds.includes(u.id)) || [];

  const handleAddUser = (userId: string) => {
    addMember.mutate(
      { projectId: project.id, userId },
      {
        onSuccess: () => {
          toast.success('Member added successfully!');
          setUserSearchOpen(false);
          onMutate();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to add member.');
        }
      }
    );
  };

  const handleRemoveUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot remove yourself from the project.");
      return;
    }
    
    if (confirm(`Are you sure you want to remove ${userName} from the project?`)) {
      removeMember.mutate(
        { projectId: project.id, userId },
        {
          onSuccess: () => {
            toast.success('Member removed successfully!');
            onMutate();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to remove member.');
          }
        }
      );
    }
  };

  const getInitials = (name?: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  };

  const getAvatarUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${apiUrl.replace('/api', '')}${path}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full border-ip-outline-variant bg-ip-surface-container-lowest font-jakarta shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-5 border-b border-ip-outline-variant bg-ip-surface shrink-0">
          <DialogTitle className="text-xl font-bold tracking-tight text-ip-on-surface flex items-center gap-2">
            <Users className="text-ip-primary" size={20} /> Manage Core Team
          </DialogTitle>
          <DialogDescription className="text-ip-on-surface-variant text-sm mt-1">
            Add or remove members from the project core team.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Add Member Combobox */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-ip-on-surface">Add New Member</label>
            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  role="combobox" 
                  aria-expanded={userSearchOpen} 
                  className="w-full justify-between bg-ip-surface border-ip-outline-variant"
                  disabled={addMember.isPending || removeMember.isPending}
                >
                  {addMember.isPending ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Adding...</span> : "Search users to add..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search by name or email..." />
                  <CommandList>
                    <CommandEmpty>No available users found.</CommandEmpty>
                    <CommandGroup>
                      {availableUsers.map((u) => (
                        <CommandItem
                          key={u.id}
                          value={`${u.name} ${u.email}`}
                          onSelect={() => handleAddUser(u.id)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-full bg-ip-surface-container-high flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                            {u.avatarUrl ? <img src={getAvatarUrl(u.avatarUrl)!} alt={u.name} className="w-full h-full object-cover" /> : getInitials(u.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate">{u.name}</span>
                            <span className="text-xs text-ip-on-surface-variant truncate">{u.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Current Members List */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-ip-on-surface">Current Members ({project.members?.length || 0})</label>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
              {project.members?.map(member => {
                const u = member.user;
                if (!u) return null;
                const isCurrentUser = currentUser?.id === u.id;
                
                return (
                  <div key={member.userId} className="flex items-center justify-between p-3 rounded-xl border border-ip-outline-variant bg-ip-surface shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full border border-ip-outline-variant flex items-center justify-center overflow-hidden bg-gradient-to-br from-ip-primary/80 to-ip-primary text-ip-on-primary font-bold text-[11px] shrink-0">
                        {u.avatarUrl ? <img src={getAvatarUrl(u.avatarUrl)!} alt={u.name} className="w-full h-full object-cover" /> : getInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-ip-on-surface text-sm flex items-center gap-2 truncate">
                          {u.name} 
                          {isCurrentUser && <span className="px-1.5 py-0.5 rounded text-[9px] bg-ip-primary/10 text-ip-primary uppercase">You</span>}
                          {project.createdById === u.id && <span className="px-1.5 py-0.5 rounded text-[9px] bg-ip-tertiary/10 text-ip-tertiary uppercase">Creator</span>}
                        </div>
                        <div className="text-xs text-ip-on-surface-variant font-medium truncate">
                          {u.role === 'Admin' ? 'Project Lead' : u.role === 'ProjectManager' ? 'Manager' : 'Engineer'} • {u.email}
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrentUser && project.createdById !== u.id && (
                      <button 
                        onClick={() => handleRemoveUser(u.id, u.name)}
                        disabled={removeMember.isPending}
                        className="p-2 rounded-lg text-ip-on-surface-variant hover:bg-ip-error-container hover:text-ip-on-error-container transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        title="Remove member"
                      >
                        {removeMember.isPending ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
