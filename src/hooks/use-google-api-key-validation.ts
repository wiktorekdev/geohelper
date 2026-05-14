import { useCallback, useEffect, useRef, useState } from "react";

import { errorMessage } from "@/lib/errors";
import { validateGoogleApiKey } from "@/lib/google-api-key";

export type KeyValidation =
  | { state: "idle"; message: string | null }
  | { state: "checking"; message: string | null }
  | { state: "valid"; message: string }
  | { state: "invalid"; message: string };

export function useGoogleApiKeyValidation(draft: string) {
  const [validation, setValidation] = useState<KeyValidation>(() =>
    draft.trim()
      ? { state: "idle", message: null }
      : { state: "invalid", message: "Google Maps API key is required." },
  );
  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  const validate = useCallback(async (key = draft.trim()) => {
    abortRef.current?.abort();
    if (!key) {
      setValidation({ state: "invalid", message: "Google Maps API key is required." });
      return;
    }

    const seq = ++seqRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setValidation({ state: "checking", message: "Checking Google API key..." });

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
        message: errorMessage(error, "Could not validate Google API key."),
      });
    }
  }, [draft]);

  useEffect(() => {
    const key = draft.trim();
    abortRef.current?.abort();

    if (!key) {
      setValidation({ state: "invalid", message: "Google Maps API key is required." });
      return;
    }

    setValidation({ state: "idle", message: "Waiting to validate..." });
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
