import { NewProjectForm } from '@/components/projects/new-project-form';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in max-w-2xl">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Projects
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <FolderKanban className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Project</h1>
          <p className="text-sm text-muted-foreground">
            Register a client engagement and define the initial target domain
          </p>
        </div>
      </div>

      <NewProjectForm />
    </div>
  );
}
