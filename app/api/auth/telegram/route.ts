import { NextResponse } from "next/server";
import { signProfileJwt } from "@/lib/auth/session";
import { upsertTelegramProfile } from "@/lib/auth/profile";
import { validateTelegramInitData } from "@/lib/auth/telegram";
import { requireEnv } from "@/lib/utils/env";

export async function POST(request: Request) {
  try {
    const { initData } = (await request.json()) as { initData?: string };
    
    // Check both conditions: ALLOW_DEV_LOGIN or NEXT_PUBLIC_DEMO_MODE
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    const allowDevLogin = process.env.ALLOW_DEV_LOGIN === "true";
    const isProduction = process.env.NODE_ENV === "production";
    
    // Allow demo/dev login if: (1) explicitly enabled AND not in production, OR (2) demo mode is on
    const canUseDevLogin = (allowDevLogin && !isProduction) || isDemoMode;

    console.log("[Auth Debug]", {
      initData: initData ? "present" : "missing",
      isDemoMode,
      allowDevLogin,
      isProduction,
      canUseDevLogin
    });

    if (!initData && !canUseDevLogin) {
      return NextResponse.json({ error: "Open this game from Telegram to sign in." }, { status: 401 });
    }

    // If initData is provided, validate it. Otherwise use demo account.
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

    console.log("[Auth Success]", {
      profileId: profile.id,
      username: profile.username,
      usedDemoAccount: !initData
    });

    return NextResponse.json({
      profile,
      accessToken
    });
  } catch (error) {
    console.error("[Auth Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Telegram authentication failed." },
      { status: 401 }
    );
  }
}
