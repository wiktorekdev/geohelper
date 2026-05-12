import { Component, type ReactNode } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[GeoHelper] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-8">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            GeoHelper hit an unexpected error. Reloading usually fixes it. If it keeps happening,
            resetting the layout settings often helps.
          </p>
          <pre className="max-h-32 overflow-auto rounded-md border border-sidebar-border bg-sidebar p-3 text-left text-[11px] text-muted-foreground font-mono">
            {this.state.error.message}
          </pre>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RotateCw className="size-3.5 mr-1.5" />
              Reload
            </Button>
            <Button
              size="sm"
              onClick={() => {
                localStorage.removeItem("geohelper.display");
                window.location.reload();
              }}
            >
              Reset layout & reload
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
