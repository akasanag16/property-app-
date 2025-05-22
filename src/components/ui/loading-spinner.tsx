
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex justify-center py-12", className)}>
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}
