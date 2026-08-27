import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '../hooks/useProjects';
import { useUsers } from '@/features/users/hooks/useUsers';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  X, 
  Upload,
  FileText,
  Link as LinkIcon,
  Plus,
  Users,
  Palette,
  Check,
  ChevronsUpDown,
  Lock,
  Globe
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional(),
  projectKey: z.string().min(2, 'At least 2 characters').max(6),
  visibility: z.string(),
  colorCode: z.string().optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#4648d4', // IP Primary
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#64748b', // Slate
];

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const createProject = useCreateProject();
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, dirtyFields } } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      projectKey: '',
      visibility: 'PUBLIC',
      colorCode: '#4648d4',
    },
  });

  const projectName = watch('name');
  const isKeyDirty = dirtyFields.projectKey;

  // Additional State
  const [date, setDate] = useState<Date>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  // Auto-generate Project Key
  useEffect(() => {
    if (projectName && !isKeyDirty) {
      const words = projectName.trim().split(/\s+/);
      let suggestedKey = '';
      
      if (words.length === 1) {
        // For a single word, take up to 4 characters
        suggestedKey = words[0].substring(0, 4).toUpperCase();
      } else {
        // For multiple words, take the first letter of the first 4 words
        suggestedKey = words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
      }

      if (suggestedKey.length > 0) {
        setValue('projectKey', suggestedKey, { shouldValidate: true });
      }
    }
  }, [projectName, isKeyDirty, setValue]);

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setDate(undefined);
      setTags([]);
      setLinks([]);
      setFiles([]);
      setSelectedUsers([]);
    }
    onOpenChange(nextOpen);
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleAddLink = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && linkInput.trim()) {
      e.preventDefault();
      if (!links.includes(linkInput.trim())) setLinks([...links, linkInput.trim()]);
      setLinkInput('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));
  const removeLink = (l: string) => setLinks(links.filter(link => link !== l));
  const removeUser = (id: string) => setSelectedUsers(selectedUsers.filter(u => u !== id));
  const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx));

  const onSubmit = async (data: CreateProjectFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('projectKey', data.projectKey.toUpperCase());
    formData.append('visibility', data.visibility);
    if (data.description) formData.append('description', data.description);
    if (data.colorCode) formData.append('colorCode', data.colorCode);
    if (date) formData.append('estimatedCompletionDate', date.toISOString());
    
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
    if (links.length > 0) {
      const stringifiedLinks = links.map(l => JSON.stringify(l));
      formData.append('externalLinks', JSON.stringify(stringifiedLinks));
    }
    if (selectedUsers.length > 0) formData.append('coreTeamMemberIds', JSON.stringify(selectedUsers));

    files.forEach(file => formData.append('documents', file));

    createProject.mutate(formData, {
      onSuccess: (project) => {
        toast.success(`Project "${project.name}" created!`);
        handleClose(false);
        navigate(`/projects/${project.id}`);
      },
      onError: (err: any) => {
        const details = err?.response?.data?.details;
        const msg = err?.response?.data?.message;
        toast.error(details ? `${msg}: ${details}` : (msg || 'Failed to create project.'));
      },
    });
  };

  const onInvalid = (validationErrors: any) => {
    Object.values(validationErrors).forEach((error: any) => {
      toast.error(error.message || 'Please check your form inputs.');
    });
  };

  const isPending = isSubmitting || createProject.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1000px] w-full border-border bg-card font-jakarta shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-5 border-b border-border bg-background shrink-0">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Create New Project</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up a workspace, invite your core team, and attach initial resources.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-project-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Basic Details */}
            <div className="space-y-6">
              
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-sm font-bold text-foreground">Project Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Acme Redesign" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="w-24 space-y-1.5">
                  <Label className="text-sm font-bold text-foreground">Key <span className="text-destructive">*</span></Label>
                  <Input placeholder="ACM" className="uppercase font-mono" {...register('projectKey')} />
                  {errors.projectKey && <p className="text-xs text-destructive">{errors.projectKey.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground">Description</Label>
                <textarea
                  rows={4}
                  placeholder="What is this project about?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary resize-none"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-foreground flex items-center gap-1.5"><Globe size={14} /> Visibility</Label>
                  <div className="flex border border-border rounded-lg overflow-hidden p-1 bg-background">
                    <button type="button" onClick={() => setValue('visibility', 'PUBLIC')} className={`flex-1 text-xs font-bold py-1.5 rounded-md flex items-center justify-center gap-1.5 ${watch('visibility') === 'PUBLIC' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'}`}>
                      <Globe size={12} /> Public
                    </button>
                    <button type="button" onClick={() => setValue('visibility', 'PRIVATE')} className={`flex-1 text-xs font-bold py-1.5 rounded-md flex items-center justify-center gap-1.5 ${watch('visibility') === 'PRIVATE' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'}`}>
                      <Lock size={12} /> Private
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-foreground flex items-center gap-1.5"><CalendarIcon size={14} /> Target Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-border bg-background", !date && "text-muted-foreground")}>
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground flex items-center gap-1.5"><Palette size={14} /> Theme Color</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color} type="button" onClick={() => setValue('colorCode', color)}
                      className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110", watch('colorCode') === color ? "ring-2 ring-offset-2 ring-primary" : "")}
                      style={{ backgroundColor: color }}
                    >
                      {watch('colorCode') === color && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Resources & Team */}
            <div className="space-y-6">
              
              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-semibold text-muted-foreground">
                      {t} <button type="button" onClick={() => removeTag(t)} className="hover:text-destructive"><X size={12}/></button>
                    </span>
                  ))}
                </div>
                <Input placeholder="Type tag and press Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} />
              </div>

              {/* Core Team */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground flex items-center gap-1.5"><Users size={14} /> Core Team</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedUsers.map(id => {
                    const u = users?.find(user => user.id === id);
                    return u ? (
                      <span key={id} className="flex items-center gap-1.5 bg-background px-2 py-1 border border-border rounded-full text-xs font-semibold text-foreground">
                        <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[8px]">{u.name[0]}</div>
                        {u.name}
                        <button type="button" onClick={() => removeUser(id)} className="hover:text-destructive"><X size={12}/></button>
                      </span>
                    ) : null;
                  })}
                </div>
                <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={userSearchOpen} className="w-full justify-between bg-background border-border">
                      Invite team members...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {users?.filter(u => !selectedUsers.includes(u.id)).map((u) => (
                            <CommandItem
                              key={u.id}
                              value={u.name}
                              onSelect={() => {
                                setSelectedUsers([...selectedUsers, u.id]);
                                setUserSearchOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedUsers.includes(u.id) ? "opacity-100" : "opacity-0")} />
                              {u.name} ({u.email})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* External Links */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground flex items-center gap-1.5"><LinkIcon size={14} /> External Links</Label>
                <div className="space-y-2 mb-2">
                  {links.map(l => (
                    <div key={l} className="flex items-center justify-between bg-background border border-border px-3 py-2 rounded-lg text-sm">
                      <span className="truncate flex-1 font-medium">{l}</span>
                      <button type="button" onClick={() => removeLink(l)} className="text-muted-foreground hover:text-destructive"><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="https://..." value={linkInput} onChange={e => setLinkInput(e.target.value)} onKeyDown={handleAddLink} />
                  <Button type="button" variant="outline" onClick={() => handleAddLink({ key: 'Enter', preventDefault: () => {} } as any)}><Plus size={16}/></Button>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground flex items-center gap-1.5"><FileText size={14} /> Documents</Label>
                <div className="space-y-2 mb-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-background border border-border px-3 py-2 rounded-lg text-sm">
                      <span className="truncate flex-1 font-medium">{f.name}</span>
                      <span className="text-xs text-muted-foreground font-mono mx-3">{(f.size/1024/1024).toFixed(1)}MB</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive"><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={e => {
                  if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
                  e.target.value = '';
                }} />
                <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} className="mr-2" /> Upload Files
                </Button>
              </div>

            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-background shrink-0">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>Cancel</Button>
          <Button type="submit" form="create-project-form" disabled={isPending} className="bg-primary hover:bg-primary/20">
            {isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
