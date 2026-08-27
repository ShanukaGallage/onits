import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useUpdateProject } from '../hooks/useProjects';
import type { Project } from '@/types';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  X, 
  Upload,
  FileText,
  Link as LinkIcon,
  Plus,
  Palette,
  Check,
  Lock,
  Globe
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
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

const editProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional(),
  projectKey: z.string().min(2, 'At least 2 characters').max(6),
  visibility: z.string(),
  colorCode: z.string().optional(),
});

type EditProjectFormValues = z.infer<typeof editProjectSchema>;

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

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export default function EditProjectModal({ open, onOpenChange, project }: EditProjectModalProps) {
  const updateProject = useUpdateProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      projectKey: project.projectKey,
      visibility: project.visibility || 'PUBLIC',
      colorCode: project.colorCode || '#4648d4',
    },
  });

  // Additional State
  const [date, setDate] = useState<Date | undefined>(
    project.estimatedCompletionDate ? new Date(project.estimatedCompletionDate) : undefined
  );
  const [tags, setTags] = useState<string[]>(project.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [links, setLinks] = useState<string[]>(project.externalLinks || []);
  const [linkInput, setLinkInput] = useState('');
  
  // We only track new files to upload for this basic edit implementation
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Reset form when opened with new project data
  useEffect(() => {
    if (open) {
      reset({
        name: project.name,
        description: project.description || '',
        projectKey: project.projectKey,
        visibility: project.visibility || 'PUBLIC',
        colorCode: project.colorCode || '#4648d4',
      });
      setDate(project.estimatedCompletionDate ? new Date(project.estimatedCompletionDate) : undefined);
      setTags(project.tags || []);
      setLinks(project.externalLinks || []);
      setNewFiles([]);
    }
  }, [open, project, reset]);

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setNewFiles([]);
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
  const removeNewFile = (idx: number) => setNewFiles(newFiles.filter((_, i) => i !== idx));

  const onSubmit = async (data: EditProjectFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('projectKey', data.projectKey.toUpperCase());
    formData.append('visibility', data.visibility);
    if (data.description) formData.append('description', data.description);
    if (data.colorCode) formData.append('colorCode', data.colorCode);
    if (date) formData.append('estimatedCompletionDate', date.toISOString());
    else formData.append('estimatedCompletionDate', ''); // clear date
    
    formData.append('tags', JSON.stringify(tags));
    formData.append('externalLinks', JSON.stringify(links));

    newFiles.forEach(file => formData.append('documents', file));

    updateProject.mutate(project.id, formData, {
      onSuccess: () => {
        toast.success(`Project "${data.name}" updated!`);
        handleClose(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Failed to update project.');
      },
    });
  };

  const isPending = isSubmitting || updateProject.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1000px] w-full border-border bg-card font-jakarta shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-5 border-b border-border bg-background shrink-0">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Edit Project Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your project's settings, links, and documents.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-project-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
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
                  <div className="flex gap-2">
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
                    {date && (
                      <Button variant="outline" type="button" className="px-2" onClick={() => setDate(undefined)}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
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

            {/* RIGHT COLUMN: Resources & Links */}
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
                <Label className="text-sm font-bold text-foreground flex items-center gap-1.5"><FileText size={14} /> Add New Documents</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Currently attached documents cannot be removed from here yet.
                </div>
                <div className="space-y-2 mb-2">
                  {newFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-primary/5 border border-primary/20 px-3 py-2 rounded-lg text-sm">
                      <span className="truncate flex-1 font-medium text-primary">{f.name}</span>
                      <span className="text-xs text-primary/60 font-mono mx-3">{(f.size/1024/1024).toFixed(1)}MB</span>
                      <button type="button" onClick={() => removeNewFile(i)} className="text-primary/60 hover:text-destructive"><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={e => {
                  if (e.target.files) setNewFiles([...newFiles, ...Array.from(e.target.files)]);
                  e.target.value = '';
                }} />
                <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} className="mr-2" /> Select Files to Add
                </Button>
              </div>

            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-background shrink-0">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>Cancel</Button>
          <Button type="submit" form="edit-project-form" disabled={isPending} className="bg-primary hover:bg-primary/20">
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
