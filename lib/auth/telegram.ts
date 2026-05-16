import "server-only";

import crypto from "node:crypto";
import type { TelegramInitUser } from "@/types/telegram";

export type VerifiedTelegramInitData = {
  user: TelegramInitUser;
  authDate: number;
  queryId: string | null;
  startParam: string | null;
};

function timingSafeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 60 * 60 * 24
): VerifiedTelegramInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    throw new Error("Telegram init data is missing a hash.");
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  if (!timingSafeEqualHex(calculatedHash, hash)) {
    throw new Error("Telegram init data hash is invalid.");
  }

  const authDate = Number(params.get("auth_date"));

  if (!Number.isFinite(authDate)) {
    throw new Error("Telegram init data is missing auth_date.");
  }

  const age = Math.floor(Date.now() / 1000) - authDate;

  if (age > maxAgeSeconds) {
    throw new Error("Telegram init data is too old.");
  }

  const rawUser = params.get("user");

  if (!rawUser) {
    throw new Error("Telegram init data is missing user.");
  }

  const user = JSON.parse(rawUser) as TelegramInitUser;

  if (!user.id || !user.first_name) {
    throw new Error("Telegram user payload is incomplete.");
  }

  return {
    user,
    authDate,
    queryId: params.get("query_id"),
    startParam: params.get("start_param")
  };
}
