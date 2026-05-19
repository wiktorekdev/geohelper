import { AlertTriangle } from "lucide-react";

import type { KeyValidation } from "@/hooks/use-google-api-key-validation";

export function KeyValidationMessage({ validation }: { validation: KeyValidation }) {
  // Only surface error states. Valid keys stay quiet so the field doesn't flash
  // green every keystroke.
  if (validation.state !== "invalid") return null;
  if (!validation.message) return null;

  return (
    <div className="mt-1.5 inline-flex items-start gap-1.5 text-[11px] text-amber-300">
      <AlertTriangle className="mt-0.5 size-3" />
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
