import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, employeeId } = body;

    if (!employeeId || !String(employeeId).trim()) {
      return NextResponse.json(
        { success: false, message: "සේවක අංකය ඇතුලත් කරන්න (Employee ID is required)" },
        { status: 400 }
      );
    }

    const cleanId = String(employeeId).trim();
    const db = await getMongo();

    const user = await db.collection("users").findOne({
      role: "collector",
      employeeId: { $regex: new RegExp(`^${escapeRegex(cleanId)}$`, "i") },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "මෙම සේවක අංකය ලියාපදිංචි වී නොමැත (Employee ID not registered as a Leaf Collector)",
        },
        { status: 401 }
      );
    }

    if (name && String(name).trim() && user.name.toLowerCase() !== String(name).trim().toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          message: "තෝරාගත් නම සහ සේවක අංකය ගැලපෙන්නේ නැත (Name and Employee ID do not match)",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        assignedRoute: user.assignedRoute,
      },
    });
  } catch (error: any) {
    console.error("Field login error:", error);
    return NextResponse.json(
      { success: false, message: "සේවා දෝෂයකි (Server error)" },
      { status: 500 }
    );
  }
}
