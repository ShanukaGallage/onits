import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTask } from '../../tasks/hooks/useTasks';
import { useProjects } from '../../projects/hooks/useProjects';
import { useUsers } from '../../users/hooks/useUsers';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required.')
    .max(200, 'Title must be 200 characters or less.'),
  description: z.string().max(1000).optional().or(z.literal('')),
  projectId: z.string().min(1, 'Please select a project.'),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().optional().or(z.literal('')),
  assigneeIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  initialComment: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select a project when opened from inside a project page */
  defaultProjectId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateTaskModal({
  open,
  onOpenChange,
  defaultProjectId,
}: CreateTaskModalProps) {
  const { projects } = useProjects();
  const { data: users } = useUsers();
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      projectId: defaultProjectId ?? '',
      priority: 'Medium' as const,
      dueDate: '',
      assigneeIds: [],
      tags: [],
      initialComment: '',
    },
  });

  const selectedProjectId = watch('projectId');
  const selectedPriority  = watch('priority');
  const selectedAssignees = watch('assigneeIds') || [];
  const selectedTags = watch('tags') || [];

  const [tagInput, setTagInput] = useState('');

  function handleClose(next: boolean) {
    if (!next) {
      reset();
      setTagInput('');
    }
    onOpenChange(next);
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !selectedTags.includes(newTag)) {
        setValue('tags', [...selectedTags, newTag], { shouldValidate: true });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', selectedTags.filter(t => t !== tagToRemove), { shouldValidate: true });
  };

  const toggleAssignee = (userId: string) => {
    if (selectedAssignees.includes(userId)) {
      setValue('assigneeIds', selectedAssignees.filter(id => id !== userId), { shouldValidate: true });
    } else {
      setValue('assigneeIds', [...selectedAssignees, userId], { shouldValidate: true });
    }
  };

  const onSubmit = (data: FormValues) => {
    createTask.mutate(
      {
        title:       data.title,
        description: data.description || undefined,
        projectId:   data.projectId,
        priority:    data.priority,
        dueDate:     data.dueDate || undefined,
        assigneeIds: data.assigneeIds?.length ? data.assigneeIds : undefined,
        tags:        data.tags?.length ? data.tags : undefined,
        initialComment: data.initialComment || undefined,
      },
      {
        onSuccess: (task) => {
          toast.success(`Task "${task.title}" created.`);
          reset();
          setTagInput('');
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const msg =
            err &&
            typeof err === 'object' &&
            'response' in err &&
            (err as { response?: { data?: { message?: string } } }).response?.data?.message
              ? (err as { response: { data: { message: string } } }).response.data.message
              : 'Failed to create task. Please try again.';
          toast.error(msg);
        },
      }
    );
  };

  const isPending = createTask.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl border-ip-outline-variant bg-ip-surface-container-lowest font-jakarta text-ip-on-surface max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-xl">
        <DialogHeader className="px-6 py-5 border-b border-ip-outline-variant bg-ip-surface">
          <DialogTitle className="text-xl font-bold tracking-tight text-ip-on-surface flex items-center gap-2">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-ip-on-surface-variant text-sm mt-1">
            Fill in the details below to add a new task to your project.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-task-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar"
        >
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-ip-error-container border border-ip-error/20 rounded-lg mb-6 text-ip-on-error-container text-sm flex flex-col gap-1">
              <p className="font-semibold">Please fix the following errors:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key} className="capitalize">{key}: {error?.message as string}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-6">
            {/* Title (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="ct-title" className="text-sm font-bold text-ip-on-surface">
                Task Title <span className="text-ip-error">*</span>
              </Label>
              <Input
                id="ct-title"
                placeholder="e.g. Design landing page hero section"
                className="border-ip-outline-variant bg-ip-surface text-ip-on-surface placeholder:text-ip-outline focus-visible:border-ip-primary focus-visible:ring-ip-primary/20 text-lg py-6 shadow-sm"
                aria-describedby={errors.title ? 'ct-title-error' : undefined}
                {...register('title')}
              />
              {errors.title && (
                <p id="ct-title-error" className="text-xs text-ip-error">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="ct-desc" className="text-sm font-bold text-ip-on-surface">
                Description
              </Label>
              <textarea
                id="ct-desc"
                rows={3}
                placeholder="Add more details about this task..."
                className="w-full min-w-0 rounded-lg border border-ip-outline-variant bg-ip-surface px-3 py-2 text-sm text-ip-on-surface placeholder:text-ip-outline outline-none transition-all focus-visible:border-ip-primary focus-visible:ring-1 focus-visible:ring-ip-primary resize-none shadow-sm custom-scrollbar"
                {...register('description')}
              />
            </div>

            {/* Grid 3 Columns: Project, Priority, Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-xl border border-ip-outline-variant bg-ip-surface-container-low">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-ip-on-surface">
                  Project <span className="text-ip-error">*</span>
                </Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={(val) => setValue('projectId', val, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full border-ip-outline-variant bg-ip-surface text-ip-on-surface focus:border-ip-primary focus:ring-1 focus:ring-ip-primary">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="border-ip-outline-variant bg-ip-surface-container-lowest text-ip-on-surface">
                    {(projects ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id} className="focus:bg-ip-surface-container-high cursor-pointer">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && (
                  <p className="text-xs text-ip-error">{errors.projectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-ip-on-surface">Priority</Label>
                <Select
                  value={selectedPriority}
                  onValueChange={(val) =>
                    setValue('priority', val as 'Low' | 'Medium' | 'High', { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full border-ip-outline-variant bg-ip-surface text-ip-on-surface focus:border-ip-primary focus:ring-1 focus:ring-ip-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-ip-outline-variant bg-ip-surface-container-lowest text-ip-on-surface">
                    <SelectItem value="Low"    className="focus:bg-ip-surface-container-high cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ip-outline-variant"></div> Low
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium" className="focus:bg-ip-surface-container-high cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ip-secondary-container"></div> Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="High"   className="focus:bg-ip-surface-container-high cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ip-error"></div> High
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ct-due" className="text-sm font-bold text-ip-on-surface">
                  Due Date
                </Label>
                <Input
                  id="ct-due"
                  type="date"
                  className="w-full border-ip-outline-variant bg-ip-surface text-ip-on-surface focus-visible:border-ip-primary focus-visible:ring-1 focus-visible:ring-ip-primary"
                  {...register('dueDate')}
                />
              </div>
            </div>

            {/* Grid 2 Columns: Assignees & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Assignees */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-ip-on-surface flex items-center justify-between">
                  Assign To
                  <span className="text-xs text-ip-on-surface-variant font-normal">{selectedAssignees.length} selected</span>
                </Label>
                <div className="max-h-[140px] overflow-y-auto rounded-lg border border-ip-outline-variant bg-ip-surface p-1.5 space-y-0.5 custom-scrollbar shadow-sm">
                  {users?.map(u => (
                    <label key={u.id} className={`flex items-center gap-3 cursor-pointer text-sm transition-all py-2 px-2.5 rounded-md ${selectedAssignees.includes(u.id) ? 'bg-ip-primary-container text-ip-on-primary-container' : 'text-ip-on-surface hover:text-ip-on-surface-variant hover:bg-ip-surface-container-high'}`}>
                      <input 
                        type="checkbox" 
                        checked={selectedAssignees.includes(u.id)}
                        onChange={() => toggleAssignee(u.id)}
                        className="rounded bg-ip-surface border-ip-outline-variant text-ip-primary focus:ring-ip-primary/20 focus:ring-offset-0 focus:ring-offset-transparent w-4 h-4 cursor-pointer" 
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ip-primary to-ip-tertiary flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </label>
                  ))}
                  {!users?.length && <p className="text-xs text-ip-outline italic p-2 text-center">No team members found</p>}
                </div>
              </div>

              {/* Tags & Initial Comment */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-ip-on-surface">Tags</Label>
                  <div className="rounded-lg border border-ip-outline-variant bg-ip-surface p-2 shadow-sm focus-within:border-ip-primary focus-within:ring-1 focus-within:ring-ip-primary transition-all">
                    <div className="flex flex-wrap gap-1.5 mb-2 empty:mb-0">
                      {selectedTags.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-ip-surface-container-high text-ip-on-surface border border-ip-outline-variant">
                          {t}
                          <button type="button" onClick={() => removeTag(t)} className="text-ip-on-surface-variant hover:text-ip-error transition-colors">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      placeholder="Add tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      className="w-full bg-transparent text-sm text-ip-on-surface placeholder:text-ip-outline outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ct-comment" className="text-sm font-bold text-ip-on-surface">
                    Initial Comment
                  </Label>
                  <textarea
                    id="ct-comment"
                    rows={2}
                    placeholder="Leave a comment when creating this task..."
                    className="w-full min-w-0 rounded-lg border border-ip-outline-variant bg-ip-surface px-3 py-2 text-sm text-ip-on-surface placeholder:text-ip-outline outline-none transition-all focus-visible:border-ip-primary focus-visible:ring-1 focus-visible:ring-ip-primary resize-none shadow-sm custom-scrollbar"
                    {...register('initialComment')}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-ip-outline-variant bg-ip-surface-container shrink-0 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            type="button"
            onClick={() => handleClose(false)}
            disabled={isPending}
            className="text-ip-on-surface-variant hover:text-ip-on-surface hover:bg-ip-surface-container-high transition-colors"
          >
            Cancel
          </Button>
          <Button
            id="create-task-submit-btn"
            type="submit"
            form="create-task-form"
            disabled={isPending}
            className="bg-ip-primary hover:bg-ip-primary-container text-white hover:text-ip-on-primary-container shadow-sm transition-all min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
