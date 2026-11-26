"use server";

import { api } from "@/lib/api/server";
import { run } from "@/lib/actions";

export async function markNotificationsRead(ids: string[]) {
  return run(async () => {
    await Promise.all(
      ids.slice(0, 25).map((id) =>
        api(`/me/notifications/${id}/read`, { method: "POST" }).catch(() => undefined),
      ),
    );
  });
}
