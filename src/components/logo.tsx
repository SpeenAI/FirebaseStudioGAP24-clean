import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <FileText className="h-6 w-6" />
      <span className="font-bold text-lg font-headline">GutachtenPortal</span>
    </div>
  );
}
