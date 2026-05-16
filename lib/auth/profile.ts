import "server-only";

import type { TelegramInitUser } from "@/types/telegram";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function upsertTelegramProfile(user: TelegramInitUser) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        telegram_id: user.id,
        username: user.username ?? null,
        first_name: user.first_name,
        last_name: user.last_name ?? null,
        avatar_url: user.photo_url ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "telegram_id" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
