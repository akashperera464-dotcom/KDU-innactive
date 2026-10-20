import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export async function GET() {
  try {
    const db = await getMongo();
    const list = await db.collection("routes").find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ success: true, routes: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, factory } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, message: "මාර්ගයේ නම ඇතුලත් කරන්න (Route name is required)" },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim().toUpperCase();
    const cleanFactory = factory?.trim() || "Galpadihenna Tea Factory";
    const id = `route-${slug(cleanFactory)}__${slug(cleanName)}`;

    const db = await getMongo();

    // Same route name may exist under other factories, but not twice in one factory
    const existing = await db.collection("routes").findOne({ name: cleanName, factory: cleanFactory });
    if (existing) {
      return NextResponse.json({ success: true, route: existing, alreadyExists: true });
    }

    const newRoute = { id, name: cleanName, factory: cleanFactory, createdAt: new Date() };
    await db.collection("routes").insertOne(newRoute as any);
    return NextResponse.json({ success: true, route: newRoute });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
