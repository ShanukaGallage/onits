import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '../hooks/useProjects';
import { Users, Folder, ArrowRight, FolderOpen } from 'lucide-react';

export default function ProjectList() {
  const navigate = useNavigate();
  const { data: projects, isLoading, isError } = useProjects();

  // ─── Loading Skeletons ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col h-[200px] border-neutral-800 bg-neutral-900/30">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/2 bg-neutral-800" />
                  <Skeleton className="h-3 w-1/3 bg-neutral-800" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full bg-neutral-800" />
              <Skeleton className="h-3 w-4/5 bg-neutral-800" />
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-16 bg-neutral-800" />
              <Skeleton className="h-8 w-20 bg-neutral-800" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <Folder className="w-10 h-10 text-red-400" />
        <p className="text-sm font-medium text-red-600">Failed to load projects</p>
        <p className="text-xs text-gray-400">
          Something went wrong while fetching the projects list. Please try again.
        </p>
      </div>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────────────
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-900/10 min-h-[300px]">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900/60 border border-neutral-800 text-neutral-400 mb-4">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No projects yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Create your first project</p>
      </div>
    );
  }

  // ─── Project List Grid ──────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const memberCount = project.members?.length ?? 0;
        const initial = project.name.charAt(0).toUpperCase();

        return (
          <Card 
            key={project.id} 
            className="group relative flex flex-col justify-between overflow-hidden border-neutral-800 bg-neutral-950/40 hover:bg-neutral-900/30 transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:shadow-indigo-500/5"
          >
            {/* Top Border Glow Effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base shadow-sm">
                    {initial}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold tracking-tight text-foreground group-hover:text-indigo-400 transition-colors duration-200">
                      {project.name}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ID: {project.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-0 flex-1">
              <CardDescription className="text-sm text-neutral-400 line-clamp-2 min-h-[40px] leading-relaxed">
                {project.description || "No description provided for this project."}
              </CardDescription>
            </CardContent>

            <CardFooter className="p-6 flex items-center justify-between border-t border-neutral-900/50 mt-4 bg-neutral-950/20">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                <Users className="w-4 h-4 text-indigo-400/80" />
                <span>
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
              <Button 
                id={`view-project-${project.id}`}
                variant="outline" 
                size="sm"
                className="group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-all duration-300"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
