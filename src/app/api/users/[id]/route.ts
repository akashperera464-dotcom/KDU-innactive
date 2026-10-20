import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

    const db = await getMongo();
    await db.collection("users").deleteOne({ id });
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

/**
 * PATCH /api/users/:id — full edit support (Admin → Users).
 * Allowed fields: employeeId, name, role, assignedFactory, assignedRoute, password.
 * Blank password means "keep the current password".
 */
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

    const body = await req.json();
    const patch: Record<string, string | null> = {};

    if (typeof body.employeeId === "string" && body.employeeId.trim())
      patch.employeeId = body.employeeId.trim();
    if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
    if (typeof body.role === "string" && body.role.trim()) patch.role = body.role.trim();
    if (body.assignedFactory !== undefined)
      patch.assignedFactory = body.assignedFactory ? String(body.assignedFactory) : null;
    if (body.assignedRoute !== undefined)
      patch.assignedRoute = body.assignedRoute ? String(body.assignedRoute) : null;
    if (typeof body.password === "string" && body.password.trim())
      patch.password = body.password.trim();

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    const db = await getMongo();

    // employeeId uniqueness guard
    if (patch.employeeId) {
      const dup = await db
        .collection("users")
        .findOne({ employeeId: patch.employeeId, id: { $ne: id } });
      if (dup) {
        return NextResponse.json(
          { success: false, message: "මෙම සේවක අංකය දැනටමත් භාවිතයේ පවතී (Employee ID already in use)" },
          { status: 409 }
        );
      }
    }

    const res = await db.collection("users").updateOne({ id }, { $set: patch });
    if (res.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
