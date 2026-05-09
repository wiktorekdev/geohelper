import { cn } from "@/lib/utils";

export function DotsSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce" />
    </div>
  );
}

export function RingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block h-6 w-6 rounded-full border-[3px] border-red-500/20 border-t-red-500 animate-spin",
        className,
      )}
    />
  );
}
