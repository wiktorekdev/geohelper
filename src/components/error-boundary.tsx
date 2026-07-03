import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from "react-error-boundary"
import { RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"
import { t } from "@/lib/i18n"

function ErrorFallback({ error }: FallbackProps) {
  const errorMessage = (error as Error).message
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-8">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-lg font-semibold">{t("error.title")}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("error.message")}</p>
        <pre className="max-h-32 overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-left text-[11px] text-muted-foreground font-mono">
          {errorMessage}
        </pre>
        <div className="flex items-center justify-center pt-2">
          <Button size="sm" onClick={() => window.location.reload()}>
            <RotateCw className="size-3.5 mr-1.5" />
            {t("error.reload")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        logger.error("[GeoHelper] Uncaught error:", error, info.componentStack)
      }}
      onReset={() => {
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
