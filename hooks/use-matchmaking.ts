"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GameRole, RoomPrivacy } from "@/types/database";
import { useSessionStore } from "@/stores/session-store";

type MatchmakingPayload = {
  roomId: string;
  code: string;
};

type ApiError = {
  error: string;
};

function isApiError(payload: unknown): payload is ApiError {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as ApiError).error === "string"
  );
}

export function useMatchmaking() {
  const router = useRouter();
  const accessToken = useSessionStore((state) => state.accessToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post<T extends object>(url: string, body: Record<string, unknown>) {
    if (!accessToken) {
      throw new Error("You need to sign in with Telegram first.");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    });

    const payload = (await response.json()) as T | ApiError;

    if (isApiError(payload)) {
      throw new Error(payload.error);
    }

    if (!response.ok) {
      throw new Error("Request failed.");
    }

    return payload as T;
  }

  async function startQueue(preferredRole: GameRole | "random" = "random") {
    setIsLoading(true);
    setError(null);

    try {
      const room = await post<MatchmakingPayload>("/api/matchmaking/queue", { preferredRole });
      router.push(`/room/${room.roomId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to find a match.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createRoom(options: { privacy: RoomPrivacy; preferredRole: GameRole | "random"; turnSeconds: number }) {
    setIsLoading(true);
    setError(null);

    try {
      const room = await post<MatchmakingPayload>("/api/rooms/create", options);
      router.push(`/room/${room.roomId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create room.");
    } finally {
      setIsLoading(false);
    }
  }

  async function joinRoom(code: string) {
    setIsLoading(true);
    setError(null);

    try {
      const room = await post<MatchmakingPayload>("/api/rooms/join", { code });
      router.push(`/room/${room.roomId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to join room.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    startQueue,
    createRoom,
    joinRoom
  };
}
