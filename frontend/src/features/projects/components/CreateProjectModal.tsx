import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '../hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ─── Schema ───────────────────────────────────────────────────────────────────

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required.')
    .max(100, 'Project name must be 100 characters or less.'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less.')
    .optional()
    .or(z.literal('')),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const createProject = useCreateProject();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  const onSubmit = async (data: CreateProjectFormValues) => {
    createProject.mutate(data, {
      onSuccess: (project) => {
        toast.success(`Project "${project.name}" has been created successfully.`);
        reset();
        onOpenChange(false);
        navigate(`/projects/${project.id}`);
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
            : 'Failed to create project. Please try again.';

        toast.error(message);
      },
    });
  };

  const isPending = isSubmitting || createProject.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-neutral-800 bg-neutral-950 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">Create new project</DialogTitle>
          <DialogDescription className="text-neutral-400 text-sm">
            Set up a new workspace for your team. You can add project members once the project is created.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-project-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 py-2"
        >
          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cp-name" className="text-sm font-medium text-neutral-200">
              Project Name <span className="text-indigo-400">*</span>
            </Label>
            <Input
              id="cp-name"
              placeholder="e.g. Acme Website Redesign"
              className="border-neutral-800 bg-neutral-900/30 text-white placeholder:text-neutral-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              aria-describedby={errors.name ? 'cp-name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p id="cp-name-error" className="text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="cp-description" className="text-sm font-medium text-neutral-200">
              Description
            </Label>
            <textarea
              id="cp-description"
              placeholder="Provide a brief overview of the goals, timeline, or scope of this project."
              rows={4}
              className={cn(
                "w-full min-w-0 rounded-lg border border-neutral-800 bg-neutral-900/30 px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-neutral-500 focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm text-white resize-none"
              )}
              aria-describedby={errors.description ? 'cp-description-error' : undefined}
              {...register('description')}
            />
            {errors.description && (
              <p id="cp-description-error" className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0 border-t border-neutral-900/50 pt-4">
          <Button 
            variant="outline" 
            onClick={() => handleClose(false)} 
            disabled={isPending}
            className="border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            id="create-project-submit-btn"
            type="submit"
            form="create-project-form"
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {isPending ? 'Creating…' : 'Create project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
