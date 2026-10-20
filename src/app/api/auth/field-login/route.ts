import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Collector (Leaf Collector) login: Name + Password.
 * The password is the one the Admin assigned in Users → Add/Edit User.
 * (`employeeId` is still accepted as an alternative identifier for backwards
 * compatibility with older clients / offline caches.)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, password, employeeId } = body;

    const identifier = String(name || employeeId || "").trim();
    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "නම ඇතුලත් කරන්න (Name is required)" },
        { status: 400 }
      );
    }
    if (!password || !String(password).length) {
      return NextResponse.json(
        { success: false, message: "මුරපදය ඇතුලත් කරන්න (Password is required)" },
        { status: 400 }
      );
    }

    const db = await getMongo();

    const user = await db.collection("users").findOne({
      role: "collector",
      $or: [
        { name: { $regex: new RegExp(`^${escapeRegex(identifier)}$`, "i") } },
        { employeeId: { $regex: new RegExp(`^${escapeRegex(identifier)}$`, "i") } },
      ],
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "මෙම නම ලියාපදිංචි වී නොමැත (Name not registered as a Leaf Collector)",
        },
        { status: 401 }
      );
    }

    if (user.password !== String(password)) {
      return NextResponse.json(
        { success: false, message: "මුරපදය වැරදියි (Invalid password)" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        assignedFactory: user.assignedFactory || null,
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
