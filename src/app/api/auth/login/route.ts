import { NextResponse } from "next/server";
import { getMongo } from "@/db/mongo";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId, password, expectedRole } = body;

    if (!employeeId || !password) {
      return NextResponse.json(
        { success: false, message: "කරුණාකර හැඳුනුම් අංකය සහ මුරපදය ඇතුලත් කරන්න (Please enter Employee ID and Password)" },
        { status: 400 }
      );
    }

    const cleanId = String(employeeId).trim();
    const db = await getMongo();

    const user = await db
      .collection("users")
      .findOne({ $or: [{ employeeId: cleanId }, { id: cleanId }] });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "වලංගු නොවන පරිශීලක හැඳුනුම් අංකයකි (User ID not found)" },
        { status: 401 }
      );
    }

    if (user.password !== String(password).trim()) {
      return NextResponse.json(
        { success: false, message: "මුරපදය වැරදියි (Invalid password)" },
        { status: 401 }
      );
    }

    if (expectedRole === "admin" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "මෙම ගිණුමට පරිපාලක බලතල නොමැත (This account does not have Admin privileges)" },
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
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "පද්ධතියේ දෝෂයක් සිදුවිය (Authentication server error)" },
      { status: 500 }
    );
  }
}
