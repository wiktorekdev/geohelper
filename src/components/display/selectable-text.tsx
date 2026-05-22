import { useEffect } from "react"

import { useDisplayStore, textStyleToCss } from "@/lib/display-store"
import { cn } from "@/lib/utils"

type Props = {
  id: string
  children: React.ReactNode
  className?: string
  mono?: boolean
}

export function SelectableText({ id, children, className, mono }: Props) {
  const editing = useDisplayStore((s) => s.editing)
  const style = useDisplayStore((s) => s.textStyles[id])
  const hidden = useDisplayStore((s) => s.hiddenTexts[id] === true)
  const selected = useDisplayStore((s) => s.selection.includes(id))
  const setSelection = useDisplayStore((s) => s.setSelection)
  const toggleSelection = useDisplayStore((s) => s.toggleSelection)
  const registerText = useDisplayStore((s) => s.registerText)
  const unregisterText = useDisplayStore((s) => s.unregisterText)

  useEffect(() => {
    registerText(id)
    return () => unregisterText(id)
  }, [id, registerText, unregisterText])

  const css = textStyleToCss(style, mono)

  if (!editing) {
    if (hidden) return null
    return (
      <span
        className={cn(
          "transition-[color,font-size,font-weight,opacity] duration-200 ease-out",
          className
        )}
        style={css}
      >
        {children}
      </span>
    )
  }

  return (
    <span
      data-text-id={id}
      onMouseDownCapture={(event) => {
        event.stopPropagation()
        event.preventDefault()
      }}
      onClickCapture={(event) => {
        event.stopPropagation()
        event.preventDefault()
        if (event.shiftKey || event.ctrlKey || event.metaKey) {
          toggleSelection(id)
        } else {
          setSelection([id])
        }
      }}
      className={cn(
        "inline-block cursor-pointer rounded-sm outline-none transition-[background-color,color,font-size,font-weight,opacity,outline-color] duration-200 ease-out",
        // `outline` instead of `ring` so the selection halo sits OUTSIDE the
        // element and never combines with surrounding card borders into the
        // double-stroke effect.
        selected
          ? "bg-brand/12 outline outline-1 outline-offset-[2px] outline-brand/55"
          : "hover:bg-brand/[0.06] hover:outline hover:outline-1 hover:outline-offset-[2px] hover:outline-brand/20",
        hidden && "opacity-40 line-through decoration-from-font",
        // Force descendants to inherit so Button's text-xs / colors don't win.
        style && "[&_*]:!text-[length:inherit] [&_*]:!text-[color:inherit] [&_*]:!font-[inherit]",
        className
      )}
      style={css}
    >
      {/* pointer-events-none so child buttons/links don't fire while editing. */}
      <span className="pointer-events-none block">{children}</span>
    </span>
  )
}
