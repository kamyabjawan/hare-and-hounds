"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSessionStore } from "@/stores/session-store";

export function useSupabase() {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useMemo(() => {
    if (!accessToken) {
      return null;
    }

    return createSupabaseBrowserClient(accessToken);
  }, [accessToken]);
}
