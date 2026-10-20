import { NextResponse } from "next/server";
import { getMongo, newId } from "@/db/mongo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMongo();
    const list = await db.collection("custom_questions").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, questions: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, targetForm, inputType, options } = body;

    if (!title || !targetForm || !inputType) {
      return NextResponse.json(
        { success: false, message: "ප්‍රශ්න විස්තරය, ඉලක්ක පෝරමය සහ ආදාන වර්ගය අනිවාර්යයි" },
        { status: 400 }
      );
    }

    const id = body.id || newId("q");
    const newQuestion = {
      id,
      title: String(title).trim(),
      targetForm: String(targetForm).trim(),
      inputType: String(inputType).trim(),
      options: options?.trim() || null,
    };

    const db = await getMongo();
    const existing = await db.collection("custom_questions").findOne({ id });

    if (existing) {
      await db.collection("custom_questions").updateOne({ id }, { $set: newQuestion });
    } else {
      await db.collection("custom_questions").insertOne({ ...newQuestion, createdAt: new Date() } as any);
    }

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
