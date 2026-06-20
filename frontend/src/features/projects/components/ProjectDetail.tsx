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
import { Users, UserPlus, UserMinus, ShieldAlert, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-md">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">ID: {project.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-neutral-800 bg-neutral-950/40 shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-indigo-400" />
                Project Description
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-sm text-neutral-300 leading-relaxed space-y-4">
              <p className="whitespace-pre-wrap">
                {project.description || 'No description provided for this project.'}
              </p>
              <div className="pt-4 border-t border-neutral-900/60 flex flex-wrap gap-x-8 gap-y-2 text-xs text-neutral-500">
                <div>
                  Created by:{' '}
                  <span className="text-neutral-400 font-medium">{project.createdBy?.name || 'Unknown'}</span>
                </div>
                <div>
                  Created date:{' '}
                  <span className="text-neutral-400 font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Members & Manage */}
        <div className="lg:col-span-1 space-y-6">
          {/* Project Members list */}
          <Card className="border-neutral-800 bg-neutral-950/40 shadow-sm">
            <CardHeader className="p-6 border-b border-neutral-900 pb-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Members</span>
                </div>
                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/25 font-mono">
                  {project.members?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
              {!project.members || project.members.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">No members assigned to this project.</p>
              ) : (
                project.members.map((member) => {
                  const isCreator = member.userId === project.createdById;
                  const initial = member.user?.name?.charAt(0).toUpperCase() || '?';

                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-neutral-900/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold">
                          {initial}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-white truncate max-w-[120px] md:max-w-none">
                            {member.user?.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={cn('text-[9px] px-1 py-0 h-4 border', roleBadgeClass[member.user?.role])}
                            >
                              {member.user?.role}
                            </Badge>
                            {isCreator && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              >
                                Creator
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove member button: only show if not the creator */}
                      {!isCreator && (
                        <Button
                          id={`remove-member-${member.userId}`}
                          variant="ghost"
                          size="icon-xs"
                          className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={() => handleRemoveMember(member.userId)}
                          disabled={removeMember.isPending}
                          title="Remove member"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Add member Form */}
          <Card className="border-neutral-800 bg-neutral-950/40 shadow-sm">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                Add Member
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form
                id="add-member-form"
                onSubmit={handleSubmit(handleAddMemberSubmit)}
                className="space-y-3.5"
                noValidate
              >
                <div className="space-y-1.5">
                  <Label htmlFor="add-member-username" className="text-xs font-medium text-neutral-300">
                    Username <span className="text-indigo-400">*</span>
                  </Label>
                  <Input
                    id="add-member-username"
                    placeholder="e.g. johndoe"
                    className="border-neutral-800 bg-neutral-900/30 text-white placeholder:text-neutral-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                    aria-describedby={errors.username ? 'add-member-username-error' : undefined}
                    {...register('username')}
                  />
                  {errors.username && (
                    <p id="add-member-username-error" className="text-[11px] text-red-600 leading-tight">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <Button
                  id="add-member-submit-btn"
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white mt-1.5"
                >
                  {isPending ? 'Adding…' : 'Add member'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
