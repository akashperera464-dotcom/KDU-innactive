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
    await db.collection("suppliers").deleteOne({ id });
    return NextResponse.json({ success: true, message: "Supplier deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

/**
 * PATCH /api/suppliers/:id
 * Partial update — used by the reminder engine (resolve / mark active / re-open).
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

    if (typeof body.status === "string") patch.status = body.status;
    if (typeof body.resolvedAt === "string") patch.resolvedAt = body.resolvedAt;
    if (body.resolvedAt === null) patch.resolvedAt = null;
    if (typeof body.prunedDate === "string") patch.prunedDate = body.prunedDate;
    if (body.prunedDate === null) patch.prunedDate = null;
    if (typeof body.previousReason === "string") patch.previousReason = body.previousReason;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    const db = await getMongo();
    await db.collection("suppliers").updateOne({ id }, { $set: patch });
    return NextResponse.json({ success: true, message: "Supplier updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
