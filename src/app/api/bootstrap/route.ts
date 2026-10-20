import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";
import { ensureSeed } from "@/db/mongoSeed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMongo();

    let routes = await db.collection("routes").find({}).sort({ name: 1 }).toArray();
    let reasons = await db.collection("status_reasons").find({}).sort({ createdAt: 1 }).toArray();

    // Auto-seed on first boot of a fresh Atlas database
    if (routes.length === 0 || reasons.length === 0) {
      await ensureSeed(db);
      routes = await db.collection("routes").find({}).sort({ name: 1 }).toArray();
      reasons = await db.collection("status_reasons").find({}).sort({ createdAt: 1 }).toArray();
    }

    const suppliers = await db.collection("suppliers").find({}).sort({ createdAt: -1 }).toArray();
    const questions = await db.collection("custom_questions").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      routes,
      reasons,
      suppliers,
      questions,
    });
  } catch (error: any) {
    console.error("Bootstrap API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load bootstrap data" },
      { status: 500 }
    );
  }
}
