import { useEffect } from "react";

import { useDisplayStore, textStyleToCss } from "@/lib/display-store";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
};

export function SelectableText({ id, children, className, mono }: Props) {
  const editing = useDisplayStore((s) => s.editing);
  const style = useDisplayStore((s) => s.textStyles[id]);
  const hidden = useDisplayStore((s) => s.hiddenTexts[id] === true);
  const selected = useDisplayStore((s) => s.selection.includes(id));
  const setSelection = useDisplayStore((s) => s.setSelection);
  const toggleSelection = useDisplayStore((s) => s.toggleSelection);
  const registerText = useDisplayStore((s) => s.registerText);
  const unregisterText = useDisplayStore((s) => s.unregisterText);

  useEffect(() => {
    registerText(id);
    return () => unregisterText(id);
  }, [id, registerText, unregisterText]);

  const css = textStyleToCss(style, mono);

  if (!editing) {
    if (hidden) return null;
    return (
      <span className={className} style={css}>
        {children}
      </span>
    );
  }

  return (
    <span
      data-text-id={id}
      onMouseDownCapture={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onClickCapture={(event) => {
        event.stopPropagation();
        event.preventDefault();
        if (event.shiftKey || event.ctrlKey || event.metaKey) {
          toggleSelection(id);
        } else {
          setSelection([id]);
        }
      }}
      className={cn(
        "cursor-pointer inline-block rounded-sm outline-none transition-colors",
        selected
          ? "bg-brand/15 ring-1 ring-inset ring-brand/60"
          : "hover:bg-brand/5 hover:ring-1 hover:ring-inset hover:ring-brand/25",
        hidden && "opacity-40 line-through decoration-from-font",
        // Force descendants to inherit so Button's text-xs / colors don't win.
        style &&
          "[&_*]:!text-[length:inherit] [&_*]:!text-[color:inherit] [&_*]:!font-[inherit]",
        className,
      )}
      style={css}
    >
      {/* pointer-events-none so child buttons/links don't fire while editing. */}
      <span className="pointer-events-none block">
        {children}
      </span>
    </span>
  );
}
