import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="py-24 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" />
    </div>
  );
}
