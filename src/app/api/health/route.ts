import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

/**
 * Platform healthcheck — pings MongoDB Atlas with a fast `ping` command.
 * Returns { ok: true } when the Atlas cluster is reachable, otherwise { ok: false }.
 */
export async function GET() {
  try {
    const db = await getMongo();
    await db.command({ ping: 1 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
