import { NextResponse } from "next/server";
import { getMongo, newId } from "@/db/mongo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMongo();
    const list = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, users: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId, name, role, assignedRoute, password } = body;

    if (!employeeId || !name || !role) {
      return NextResponse.json(
        { success: false, message: "සියලුම අත්‍යවශ්‍ය තොරතුරු ඇතුලත් කරන්න (Required fields missing)" },
        { status: 400 }
      );
    }

    const id = body.id || newId("user");
    const newUser = {
      employeeId: String(employeeId).trim(),
      name: String(name).trim(),
      role: String(role).trim(),
      assignedRoute: assignedRoute?.trim() || "ALL",
      password: password?.trim() || "123",
    };

    const db = await getMongo();
    const existing = await db.collection("users").findOne({ employeeId: newUser.employeeId });

    if (existing) {
      await db.collection("users").updateOne({ employeeId: newUser.employeeId }, { $set: newUser });
      return NextResponse.json({ success: true, user: { id: existing.id, ...newUser } });
    }

    await db.collection("users").insertOne({ id, ...newUser, createdAt: new Date() } as any);
    return NextResponse.json({ success: true, user: { id, ...newUser } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
