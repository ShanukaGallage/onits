import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useProject, useAddMember, useRemoveMember } from '../hooks/useProjects';
import type { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, UserPlus, UserMinus, ShieldAlert, FolderKanban, LayoutDashboard, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import KanbanBoard from '@/features/tasks/components/KanbanBoard';
import TaskTable from '@/features/tasks/components/TaskTable';

type DetailTab = 'overview' | 'list' | 'board';

// ─── Schema ───────────────────────────────────────────────────────────────────

const addMemberSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required.'),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectDetailProps {
  projectId: string;
}

// ─── Badge styles ─────────────────────────────────────────────────────────────

const roleBadgeClass: Record<Role, string> = {
  Admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ProjectManager: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Collaborator: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { data: project, isLoading, isError } = useProject(projectId);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const [tab, setTab] = useState<DetailTab>('overview');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      username: '',
    },
  });

  const handleAddMemberSubmit = (data: AddMemberFormValues) => {
    addMember.mutate(
      { projectId, username: data.username },
      {
        onSuccess: () => {
          toast.success('Member added to the project successfully.');
          reset();
        },
        onError: (err: unknown) => {
          const message =
            err &&
            typeof err === 'object' &&
            'response' in err &&
            err.response &&
            typeof err.response === 'object' &&
            'data' in err.response &&
            err.response.data &&
            typeof err.response.data === 'object' &&
            'message' in err.response.data
              ? String((err.response.data as { message: string }).message)
              : 'Failed to add member.';
          toast.error(message);
        },
      }
    );
  };

  const handleRemoveMember = (userId: string) => {
    removeMember.mutate(
      { projectId, userId },
      {
        onSuccess: () => {
          toast.success('Member removed from the project successfully.');
        },
        onError: (err: unknown) => {
          const message =
            err &&
            typeof err === 'object' &&
            'response' in err &&
            err.response &&
            typeof err.response === 'object' &&
            'data' in err.response &&
            err.response.data &&
            typeof err.response.data === 'object' &&
            'message' in err.response.data
              ? String((err.response.data as { message: string }).message)
              : 'Failed to remove member.';
          toast.error(message);
        },
      }
    );
  };

  const isPending = isSubmitting || addMember.isPending;

  // ─── Loading Skeletons ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3 bg-neutral-800" />
          <Skeleton className="h-4 w-1/2 bg-neutral-800" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Skeleton */}
          <div className="lg:col-span-2">
            <Card className="border-neutral-800 bg-neutral-900/30 h-[200px]">
              <CardHeader>
                <Skeleton className="h-5 w-1/4 bg-neutral-800" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full bg-neutral-800" />
                <Skeleton className="h-3 w-full bg-neutral-800" />
                <Skeleton className="h-3 w-2/3 bg-neutral-800" />
              </CardContent>
            </Card>
          </div>

          {/* Members Panel Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-neutral-800 bg-neutral-900/30">
              <CardHeader>
                <Skeleton className="h-5 w-1/3 bg-neutral-800" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-neutral-800" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-1/2 bg-neutral-800" />
                      <Skeleton className="h-3 w-1/4 bg-neutral-800" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <ShieldAlert className="w-10 h-10 text-red-400" />
        <p className="text-sm font-medium text-red-600">Failed to load project details</p>
        <p className="text-xs text-gray-400">
          The project could not be found or you do not have permission to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-jakarta">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-ip-lg flex items-center justify-center text-ip-on-primary font-bold text-lg bg-gradient-to-br from-ip-primary to-ip-primary-container shadow-[0_4px_12px_rgba(70,72,212,0.3)]">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ip-on-surface">{project.name}</h1>
            <p className="text-xs text-ip-on-surface-variant mt-0.5">Created {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-ip-surface-container-low border border-ip-outline-variant rounded-ip-base w-fit">
        {([['overview','Overview', FolderKanban], ['list','List', List], ['board','Board', LayoutDashboard]] as [DetailTab, string, React.ElementType][]).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-ip-base text-sm font-medium transition-all duration-150 ${
              tab === id
                ? 'bg-ip-primary text-ip-on-primary shadow-[0_2px_8px_rgba(70,72,212,0.25)]'
                : 'text-ip-on-surface-variant hover:bg-ip-surface-container hover:text-ip-on-surface'
            }`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'list'  && <TaskTable   projectId={projectId} />}
      {tab === 'board' && <KanbanBoard projectId={projectId} />}

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Description */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="border-ip-outline-variant bg-ip-surface-container-lowest shadow-[0_2px_8px_rgba(70,72,212,0.04)]">
              <CardHeader className="p-6 border-b border-ip-outline-variant">
                <CardTitle className="text-sm font-bold text-ip-on-surface flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-ip-primary" />
                  Project Description
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 text-sm text-ip-on-surface leading-relaxed space-y-4">
                <p className="whitespace-pre-wrap">
                  {project.description || 'No description provided for this project.'}
                </p>
                <div className="pt-4 border-t border-ip-outline-variant/50 flex flex-wrap gap-x-8 gap-y-2 text-xs text-ip-on-surface-variant">
                  <div>Created by: <span className="text-ip-on-surface font-medium">{project.createdBy?.name || 'Unknown'}</span></div>
                  <div>Created: <span className="text-ip-on-surface font-medium">{new Date(project.createdAt).toLocaleDateString()}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members */}
          <div className="lg:col-span-1 space-y-5">
            <Card className="border-ip-outline-variant bg-ip-surface-container-lowest shadow-[0_2px_8px_rgba(70,72,212,0.04)]">
              <CardHeader className="p-5 border-b border-ip-outline-variant">
                <CardTitle className="text-sm font-bold text-ip-on-surface flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-ip-primary" />
                    Members
                  </div>
                  <Badge variant="secondary" className="bg-ip-secondary-container text-ip-on-secondary-container font-mono text-xs">
                    {project.members?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 max-h-[280px] overflow-y-auto">
                {!project.members || project.members.length === 0 ? (
                  <p className="text-sm text-ip-on-surface-variant text-center py-4">No members yet.</p>
                ) : (
                  project.members.map((member) => {
                    const isCreator = member.userId === project.createdById;
                    const initial = member.user?.name?.charAt(0).toUpperCase() || '?';
                    return (
                      <div key={member.userId} className="flex items-center justify-between gap-3 p-2 rounded-ip-base hover:bg-ip-surface-container-low transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-ip-on-primary text-xs font-semibold bg-gradient-to-br from-ip-primary to-ip-primary-container flex-shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ip-on-surface truncate max-w-[140px]">{member.user?.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className={cn('text-[9px] px-1 py-0 h-4 border', roleBadgeClass[member.user?.role])}>
                                {member.user?.role}
                              </Badge>
                              {isCreator && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-ip-primary/10 text-ip-primary border-ip-primary/20">Creator</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isCreator && (
                          <Button id={`remove-member-${member.userId}`} variant="ghost" size="icon-xs"
                            className="text-ip-on-surface-variant hover:text-ip-error hover:bg-ip-error-container transition-colors"
                            onClick={() => handleRemoveMember(member.userId)} disabled={removeMember.isPending} title="Remove">
                            <UserMinus className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Add member */}
            <Card className="border-ip-outline-variant bg-ip-surface-container-lowest shadow-[0_2px_8px_rgba(70,72,212,0.04)]">
              <CardHeader className="p-5 border-b border-ip-outline-variant">
                <CardTitle className="text-sm font-bold text-ip-on-surface flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-ip-primary" />
                  Add Member
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <form id="add-member-form" onSubmit={handleSubmit(handleAddMemberSubmit)} className="space-y-3" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="add-member-username" className="text-[11px] font-semibold uppercase tracking-widest text-ip-on-surface">
                      Username
                    </Label>
                    <Input id="add-member-username" placeholder="e.g. johndoe"
                      className="h-10 bg-ip-surface-container-low border-ip-outline-variant text-ip-on-surface text-sm rounded-ip-base focus-visible:ring-2 focus-visible:ring-ip-primary/30 focus-visible:border-ip-primary"
                      aria-describedby={errors.username ? 'add-member-username-error' : undefined}
                      {...register('username')} />
                    {errors.username && (
                      <p id="add-member-username-error" className="text-xs font-medium text-ip-error">· {errors.username.message}</p>
                    )}
                  </div>
                  <Button id="add-member-submit-btn" type="submit" disabled={isPending}
                    className="w-full h-10 bg-ip-primary hover:bg-ip-on-primary-fixed-variant text-ip-on-primary font-semibold text-sm rounded-ip-base">
                    {isPending ? 'Adding…' : 'Add member'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
