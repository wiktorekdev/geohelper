import { m, AnimatePresence } from "framer-motion";

import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function GeocodeNotice() {
  const t = useT();
  const error = useStore((s) => s.geocodeError);

  return (
    <AnimatePresence>
      {error && (
        <m.div
          initial={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", scale: 1, marginBottom: 12 }}
          exit={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mx-4 overflow-hidden rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300"
        >
          {t("geocode.lookupFailed", { error })}
        </m.div>
      )}
    </AnimatePresence>
  );
}
