"use server";

import tokenManager from "@/cache/token";

export async function revokeAccess(connectionId: string) {
  await tokenManager.delete(connectionId);
}
