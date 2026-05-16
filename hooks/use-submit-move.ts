"use client";

import { useState } from "react";
import type { MoveInput } from "@/lib/game/types";
import { useSessionStore } from "@/stores/session-store";

export function useSubmitMove(roomId: string) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitMove(move: MoveInput, stateVersion: number) {
    if (!accessToken) {
      setError("Missing Telegram session.");
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${roomId}/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          ...move,
          stateVersion,
          clientNonce: crypto.randomUUID()
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "Move rejected.");
      }

      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Move rejected.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    submitMove,
    isSubmitting,
    error
  };
}
