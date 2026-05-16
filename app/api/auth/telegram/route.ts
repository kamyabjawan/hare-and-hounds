import { NextResponse } from "next/server";
import { signProfileJwt } from "@/lib/auth/session";
import { upsertTelegramProfile } from "@/lib/auth/profile";
import { validateTelegramInitData } from "@/lib/auth/telegram";
import { requireEnv } from "@/lib/utils/env";

export async function POST(request: Request) {
  try {
    const { initData } = (await request.json()) as { initData?: string };
    const allowDevLogin = process.env.ALLOW_DEV_LOGIN === "true" && process.env.NODE_ENV !== "production";

    if (!initData && !allowDevLogin) {
      return NextResponse.json({ error: "Open this game from Telegram to sign in." }, { status: 401 });
    }

    const verified = initData
      ? validateTelegramInitData(initData, requireEnv("TELEGRAM_BOT_TOKEN"))
      : {
          user: {
            id: 900000001,
            first_name: "Demo",
            last_name: "Player",
            username: "demo_player"
          }
        };

    const profile = await upsertTelegramProfile(verified.user);
    const accessToken = await signProfileJwt(profile);

    return NextResponse.json({
      profile,
      accessToken
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Telegram authentication failed." },
      { status: 401 }
    );
  }
}
