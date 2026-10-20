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
    await db.collection("custom_questions").deleteOne({ id });
    return NextResponse.json({ success: true, message: "Question deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
