import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    if (!id) return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });

    const db = await getMongo();
    await db.collection("entries").deleteOne({ id });

    return NextResponse.json({ success: true, message: "Entry deleted successfully" });
  } catch (error: any) {
    console.error("DELETE entry error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete entry" },
      { status: 500 }
    );
  }
}
