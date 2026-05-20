import { useCallback, useEffect, useRef, useState } from "react";

import { errorMessage } from "@/lib/errors";
import { validateGoogleApiKey } from "@/lib/google-api-key";
import { t } from "@/lib/i18n";

export type KeyValidation =
  | { state: "idle"; message: string | null }
  | { state: "checking"; message: string | null }
  | { state: "valid"; message: string }
  | { state: "invalid"; message: string };

export function useGoogleApiKeyValidation(draft: string) {
  const [validation, setValidation] = useState<KeyValidation>({ state: "idle", message: null });
  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  const validate = useCallback(async (key = draft.trim()) => {
    abortRef.current?.abort();
    if (!key) {
      setValidation({ state: "idle", message: null });
      return;
    }

    const seq = ++seqRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setValidation({ state: "checking", message: t("validation.checking") });

    try {
      const result = await validateGoogleApiKey(key, controller.signal);
      if (seq !== seqRef.current) return;
      setValidation({
        state: result.ok ? "valid" : "invalid",
        message: result.message,
      });
    } catch (error) {
      if (controller.signal.aborted || seq !== seqRef.current) return;
      setValidation({
        state: "invalid",
        message: errorMessage(error, t("validation.error")),
      });
    }
  }, [draft]);

  useEffect(() => {
    const key = draft.trim();
    abortRef.current?.abort();

    if (!key) {
      setValidation({ state: "idle", message: null });
      return;
    }

    setValidation({ state: "idle", message: t("validation.waiting") });
    const timeout = window.setTimeout(() => {
      void validate(key);
    }, 700);

    return () => {
      window.clearTimeout(timeout);
      abortRef.current?.abort();
    };
  }, [draft, validate]);

  return { validation, validate };
}
