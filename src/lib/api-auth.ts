import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";

export async function requireApiUser() {
  const session = await getServerAuthSession();
  return session?.user ?? null;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
