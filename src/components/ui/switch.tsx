import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, Ref } from "react"

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  ref?: Ref<HTMLButtonElement>
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
  ref,
  ...props
}: Props) {
  return (
    <button
      ref={ref}
      id={id}
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 cursor-default items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-brand border-brand" : "bg-white/[0.08] border-white/[0.06]",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-3 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[15px]" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
