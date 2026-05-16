"use client";

import { useEffect, useMemo, useState } from "react";

export function usePlayerTimer(deadline: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!deadline) {
      return {
        remainingMs: 0,
        remainingSeconds: 0,
        progress: 0,
        expired: false
      };
    }

    const end = new Date(deadline).getTime();
    const remainingMs = Math.max(0, end - now);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    return {
      remainingMs,
      remainingSeconds,
      progress: remainingMs / 1000,
      expired: remainingMs === 0
    };
  }, [deadline, now]);
}
