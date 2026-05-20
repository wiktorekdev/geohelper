import { openUrl } from "@tauri-apps/plugin-opener"

import { GithubIcon, KofiIcon } from "@/components/brand-icons"
import { GITHUB_URL, KOFI_URL } from "@/lib/links"

export function SocialFooter() {
  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-sidebar-border">
      <IconLink href={GITHUB_URL} title="GitHub">
        <GithubIcon className="size-4" />
      </IconLink>
      <IconLink href={KOFI_URL} title="Ko-fi">
        <KofiIcon className="size-4" />
      </IconLink>
    </div>
  )
}

function IconLink({
  href,
  title,
  children,
}: {
  href: string
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={() => openUrl(href)}
      title={title}
      className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      {children}
    </button>
  )
}
