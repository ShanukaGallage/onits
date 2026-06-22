import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateUser } from '../hooks/useUsers';
import type { Role } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Schema ───────────────────────────────────────────────────────────────────

const ROLES: Role[] = ['Admin', 'ProjectManager', 'Collaborator'];

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be at most 30 characters.')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['Admin', 'ProjectManager', 'Collaborator'], {
    message: 'Please select a role.',
  }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  });

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  const onSubmit = async (data: CreateUserFormValues) => {
    createUser.mutate(data, {
      onSuccess: (created) => {
        toast.success(`${created.name} has been added successfully.`);
        reset();
        onOpenChange(false);
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
            : 'Failed to create user. Please try again.';

        toast.error(message);
      },
    });
  };

  const isPending = isSubmitting || createUser.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
          <DialogDescription>
            Create an account for a new team member. They will receive an email to set their
            password.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-user-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 py-2"
        >
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="cu-username">Username</Label>
            <Input
              id="cu-username"
              placeholder="e.g. johndoe"
              aria-describedby={errors.username ? 'cu-username-error' : 'cu-username-hint'}
              {...register('username')}
            />
            {errors.username ? (
              <p id="cu-username-error" className="text-xs text-red-600">
                {errors.username.message}
              </p>
            ) : (
              <p id="cu-username-hint" className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and underscores only. Cannot be changed later.
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cu-name">Full name</Label>
            <Input
              id="cu-name"
              placeholder="Jane Smith"
              aria-describedby={errors.name ? 'cu-name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p id="cu-name-error" className="text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="cu-email">Email address</Label>
            <Input
              id="cu-email"
              type="email"
              placeholder="jane@onits.app"
              aria-describedby={errors.email ? 'cu-email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="cu-email-error" className="text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="cu-role">Role</Label>
            <Select
              onValueChange={(value) => setValue('role', value as Role, { shouldValidate: true })}
            >
              <SelectTrigger id="cu-role" aria-describedby={errors.role ? 'cu-role-error' : undefined}>
                <SelectValue placeholder="Select a role…" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p id="cu-role-error" className="text-xs text-red-600">
                {errors.role.message}
              </p>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            id="create-user-submit-btn"
            type="submit"
            form="create-user-form"
            disabled={isPending}
          >
            {isPending ? 'Creating…' : 'Create user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
