import { m, AnimatePresence } from "framer-motion";

import { useStore } from "@/lib/store";
import { InfoRow } from "./info-row";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

export function RoadSection() {
  const t = useT();
  const place = useStore((s) => s.place);
  const show = !!(place.road || place.postcode);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <m.div
          key="road-card"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <Card className="mx-4 my-2 p-3.5 space-y-1.5">
            {place.road && <InfoRow id="road.road" label={t("location.road")} value={place.road} />}
            {place.postcode && (
              <InfoRow id="road.postcode" label={t("location.postcode")} value={place.postcode} mono />
            )}
          </Card>
        </m.div>
      )}
    </AnimatePresence>
  );
}
