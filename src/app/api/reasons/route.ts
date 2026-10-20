import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMongo();
    const list = await db.collection("status_reasons").find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json({ success: true, reasons: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: rawId, labelSi, labelEn, badgeColor } = body;

    if (!labelSi || !labelEn) {
      return NextResponse.json(
        { success: false, message: "සිංහල සහ ඉංග්‍රීසි නම් දෙකම ඇතුලත් කරන්න (Both Sinhala & English labels required)" },
        { status: 400 }
      );
    }

    const id = String(rawId || labelEn)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/^_+|_+$/g, "");

    const newReason = {
      id,
      labelSi: String(labelSi).trim(),
      labelEn: String(labelEn).trim(),
      badgeColor: badgeColor || "#10B981",
    };

    const db = await getMongo();
    const existing = await db.collection("status_reasons").findOne({ id });

    if (existing) {
      await db.collection("status_reasons").updateOne({ id }, { $set: newReason });
    } else {
      await db.collection("status_reasons").insertOne({ ...newReason, createdAt: new Date() } as any);
    }

    return NextResponse.json({ success: true, reason: newReason });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
