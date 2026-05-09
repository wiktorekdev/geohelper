import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        indigo: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
        purple: "border-purple-500/40 bg-purple-500/10 text-purple-300",
        emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
        rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
        amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        red: "border-red-500/40 bg-red-500/10 text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
