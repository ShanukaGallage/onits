import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useUpdateUser } from '../hooks/useUsers';
import type { Role, User } from '@/types';
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

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['Admin', 'ProjectManager', 'Collaborator'], {
    message: 'Please select a role.',
  }),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Collaborator',
    }
  });

  // Populate form when user changes
  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('role', user.role);
    }
  }, [user, setValue]);

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      onClose();
    }
  }

  const onSubmit = async (data: UpdateUserFormValues) => {
    if (!user) return;
    updateUser.mutate({ id: user.id, ...data }, {
      onSuccess: (updated) => {
        toast.success(`${updated.name}'s profile has been updated.`);
        reset();
        onClose();
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
            : 'Failed to update user. Please try again.';

        toast.error(message);
      },
    });
  };

  const isPending = isSubmitting || updateUser.isPending;

  return (
    <Dialog open={!!user} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update this user's personal details and platform role.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-user-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 py-2"
        >
          {/* Username (Disabled) */}
          <div className="space-y-1.5">
            <Label htmlFor="eu-username">Username</Label>
            <Input
              id="eu-username"
              value={user?.username || ''}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Username cannot be changed.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="eu-name">Full name</Label>
            <Input
              id="eu-name"
              placeholder="Jane Smith"
              aria-describedby={errors.name ? 'eu-name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p id="eu-name-error" className="text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="eu-email">Email address</Label>
            <Input
              id="eu-email"
              type="email"
              placeholder="jane@onits.app"
              aria-describedby={errors.email ? 'eu-email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="eu-email-error" className="text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="eu-role">Role</Label>
            <Select
              value={watch('role')}
              onValueChange={(value) => setValue('role', value as Role, { shouldValidate: true })}
            >
              <SelectTrigger id="eu-role" aria-describedby={errors.role ? 'eu-role-error' : undefined}>
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
              <p id="eu-role-error" className="text-xs text-red-600">
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
            id="edit-user-submit-btn"
            type="submit"
            form="edit-user-form"
            disabled={isPending}
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
