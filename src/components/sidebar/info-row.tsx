import { SelectableText } from "@/components/display/selectable-text"
import { cn } from "@/lib/utils"

export function InfoRow({
  id,
  label,
  value,
  mono,
}: {
  id: string
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <SelectableText id={`${id}.label`} className="text-muted-foreground">
        {label}
      </SelectableText>
      <SelectableText
        id={`${id}.value`}
        mono={mono}
        className={cn("ml-2 truncate", mono && "font-mono")}
      >
        {value}
      </SelectableText>
    </div>
  )
}
