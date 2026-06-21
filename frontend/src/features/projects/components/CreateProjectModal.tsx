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
      <DialogContent className="sm:max-w-md border-ip-outline-variant bg-ip-surface-container-lowest font-jakarta shadow-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-ip-on-surface">Create new project</DialogTitle>
          <DialogDescription className="text-ip-on-surface-variant text-sm">
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
            <Label htmlFor="cp-name" className="text-sm font-bold text-ip-on-surface">
              Project Name <span className="text-ip-error">*</span>
            </Label>
            <Input
              id="cp-name"
              placeholder="e.g. Acme Website Redesign"
              className="border-ip-outline-variant bg-ip-surface text-ip-on-surface placeholder:text-ip-on-surface-variant/50 focus-visible:border-ip-primary focus-visible:ring-ip-primary/20 transition-all rounded-lg"
              aria-describedby={errors.name ? 'cp-name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p id="cp-name-error" className="text-xs text-ip-error font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="cp-description" className="text-sm font-bold text-ip-on-surface">
              Description
            </Label>
            <textarea
              id="cp-description"
              placeholder="Provide a brief overview of the goals, timeline, or scope of this project."
              rows={4}
              className={cn(
                "w-full min-w-0 rounded-lg border border-ip-outline-variant bg-ip-surface px-3 py-2 text-sm transition-colors outline-none placeholder:text-ip-on-surface-variant/50 focus-visible:border-ip-primary focus-visible:ring-2 focus-visible:ring-ip-primary/20 text-ip-on-surface resize-none disabled:opacity-50"
              )}
              aria-describedby={errors.description ? 'cp-description-error' : undefined}
              {...register('description')}
            />
            {errors.description && (
              <p id="cp-description-error" className="text-xs text-ip-error font-medium">
                {errors.description.message}
              </p>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0 border-t border-ip-outline-variant pt-4 mt-2">
          <Button 
            variant="outline" 
            onClick={() => handleClose(false)} 
            disabled={isPending}
            className="border-ip-outline-variant text-ip-on-surface-variant hover:bg-ip-surface-container-low hover:text-ip-on-surface font-semibold rounded-lg"
          >
            Cancel
          </Button>
          <Button
            id="create-project-submit-btn"
            type="submit"
            form="create-project-form"
            disabled={isPending}
            className="bg-ip-primary hover:bg-ip-on-primary-fixed-variant text-ip-on-primary font-bold shadow-sm hover:shadow-md rounded-lg"
          >
            {isPending ? 'Creating…' : 'Create project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
