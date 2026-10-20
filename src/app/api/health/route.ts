import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

/**
 * Platform healthcheck — reports SERVER liveness.
 * Always returns HTTP 200 while the server process is alive; the MongoDB
 * reachability is reported inside the body as `db` so a database outage can
 * never take down the deployment's health gate.
 */
export async function GET() {
  let dbOk = false;
  try {
    const db = await getMongo();
    await db.command({ ping: 1 });
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return NextResponse.json({ ok: true, db: dbOk });
}
