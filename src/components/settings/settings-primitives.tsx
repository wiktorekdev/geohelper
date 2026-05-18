import { AlertTriangle, Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { KeyValidation } from "@/hooks/use-google-api-key-validation";

export function KeyValidationMessage({ validation }: { validation: KeyValidation }) {
  if (!validation.message) return null;

  return (
    <div
      className={cn(
        "mt-1.5 inline-flex items-start gap-1.5 text-[11px]",
        validation.state === "valid" && "text-emerald-400",
        validation.state === "invalid" && "text-amber-300",
        validation.state !== "valid" && validation.state !== "invalid" && "text-muted-foreground",
      )}
    >
      {validation.state === "checking" && <Loader2 className="mt-0.5 size-3 animate-spin" />}
      {validation.state === "valid" && <Check className="mt-0.5 size-3" />}
      {validation.state === "invalid" && <AlertTriangle className="mt-0.5 size-3" />}
      <span>{validation.message}</span>
    </div>
  );
}

export function Group({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 px-5 py-4">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

export function Divider() {
  return <div className="mx-4 h-px bg-sidebar-border" />;
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-mono">{value}</span>
    </div>
  );
}

export function SocialIcon({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
