import { useStore } from "@/lib/store";

export function GeocodeNotice() {
  const error = useStore((s) => s.geocodeError);
  if (!error) return null;
  return (
    <div className="mx-4 mb-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
      Location lookup failed: {error}
    </div>
  );
}
