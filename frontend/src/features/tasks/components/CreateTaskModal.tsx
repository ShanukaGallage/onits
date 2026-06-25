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
      <DialogContent className="sm:max-w-md border-neutral-800 bg-neutral-950 text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Create new task
          </DialogTitle>
          <DialogDescription className="text-neutral-400 text-sm">
            Add a task to a project. You can assign people and set a due date after creation.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-task-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 py-2"
        >
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-900/30 border border-red-500 rounded-md mb-4 text-red-200 text-xs">
              <p className="font-bold mb-1">Please fix the following errors:</p>
              <ul className="list-disc pl-5">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>{key}: {error?.message as string}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="ct-title" className="text-sm font-medium text-neutral-200">
              Task Title <span className="text-indigo-400">*</span>
            </Label>
            <Input
              id="ct-title"
              placeholder="e.g. Design landing page hero section"
              className="border-neutral-800 bg-neutral-900/30 text-white placeholder:text-neutral-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              aria-describedby={errors.title ? 'ct-title-error' : undefined}
              {...register('title')}
            />
            {errors.title && (
              <p id="ct-title-error" className="text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Project selector */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-200">
              Project <span className="text-indigo-400">*</span>
            </Label>
            <Select
              value={selectedProjectId}
              onValueChange={(val) => setValue('projectId', val, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full border-neutral-800 bg-neutral-900/30 text-white focus:border-indigo-500 focus:ring-indigo-500/20">
                <SelectValue placeholder="Select a project…" />
              </SelectTrigger>
              <SelectContent className="border-neutral-800 bg-neutral-900">
                {(projects ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-white focus:bg-neutral-800">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-xs text-red-500">{errors.projectId.message}</p>
            )}
          </div>

          {/* Priority + Due date row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-neutral-200">Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={(val) =>
                  setValue('priority', val as 'Low' | 'Medium' | 'High', { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full border-neutral-800 bg-neutral-900/30 text-white focus:border-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-neutral-800 bg-neutral-900">
                  <SelectItem value="Low"    className="text-white focus:bg-neutral-800">Low</SelectItem>
                  <SelectItem value="Medium" className="text-white focus:bg-neutral-800">Medium</SelectItem>
                  <SelectItem value="High"   className="text-white focus:bg-neutral-800">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label htmlFor="ct-due" className="text-sm font-medium text-neutral-200">
                Due Date
              </Label>
              <Input
                id="ct-due"
                type="date"
                className="border-neutral-800 bg-neutral-900/30 text-white focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                {...register('dueDate')}
              />
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-200">Assignees</Label>
            <div className="max-h-24 overflow-y-auto border border-neutral-800 bg-neutral-900/30 rounded-md p-2 space-y-1 custom-scrollbar">
              {users?.map(u => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer text-sm text-neutral-300 hover:text-white transition-colors py-0.5">
                  <input 
                    type="checkbox" 
                    checked={selectedAssignees.includes(u.id)}
                    onChange={() => toggleAssignee(u.id)}
                    className="rounded bg-neutral-800 border-neutral-700 text-indigo-500 focus:ring-indigo-500/20" 
                  />
                  {u.name}
                </label>
              ))}
              {!users?.length && <p className="text-xs text-neutral-500 italic">No users found</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-200">Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-neutral-500 hover:text-red-400">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="border-neutral-800 bg-neutral-900/30 text-white placeholder:text-neutral-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ct-desc" className="text-sm font-medium text-neutral-200">
              Description <span className="text-neutral-500 font-normal">(optional)</span>
            </Label>
            <textarea
              id="ct-desc"
              rows={2}
              placeholder="What needs to be done?"
              className="w-full min-w-0 rounded-lg border border-neutral-800 bg-neutral-900/30 px-2.5 py-1.5 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 resize-none"
              {...register('description')}
            />
          </div>

          {/* Initial Comment */}
          <div className="space-y-1.5">
            <Label htmlFor="ct-comment" className="text-sm font-medium text-neutral-200">
              Initial Comment <span className="text-neutral-500 font-normal">(optional)</span>
            </Label>
            <textarea
              id="ct-comment"
              rows={2}
              placeholder="Leave a comment when creating this task..."
              className="w-full min-w-0 rounded-lg border border-neutral-800 bg-neutral-900/30 px-2.5 py-1.5 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 resize-none"
              {...register('initialComment')}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-neutral-900/50 pt-4 mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleClose(false)}
              disabled={isPending}
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              id="create-task-submit-btn"
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
