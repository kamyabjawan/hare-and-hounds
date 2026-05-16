import "server-only";

import { SignJWT, jwtVerify } from "jose";
import type { Profile } from "@/types/database";
import { requireEnv } from "@/lib/utils/env";

const issuer = "hare-and-hounds";
const audience = "authenticated";

function secretKey() {
  return new TextEncoder().encode(requireEnv("SUPABASE_JWT_SECRET"));
}

export async function signProfileJwt(profile: Pick<Profile, "id" | "telegram_id">) {
  return new SignJWT({
    role: "authenticated",
    telegram_id: profile.telegram_id
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(profile.id)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey());
}

export async function verifyRequestSession(request: Request) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    throw new Error("Missing bearer token.");
  }

  const verified = await jwtVerify(token, secretKey(), {
    issuer,
    audience
  });

  const profileId = verified.payload.sub;

  if (!profileId) {
    throw new Error("Session token is missing a subject.");
  }

  return {
    token,
    profileId,
    telegramId: Number(verified.payload.telegram_id)
  };
}
