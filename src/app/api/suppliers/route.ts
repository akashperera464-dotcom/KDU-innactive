import { NextResponse } from "next/server";
import { getMongo, newId } from "@/db/mongo";

export const dynamic = "force-dynamic";

function normalizeReason(raw?: string | null): string | null {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v) return null;
  const lower = v.toLowerCase();
  const known = [
    "provides_leaves",
    "fertilizer_issue",
    "low_leaf_amount",
    "given_to_another_book",
    "cannot_be_contacted",
    "garden_pruned",
    "not_registered",
    "personal_reason",
    "transport_issue",
  ];
  if (known.includes(lower)) return lower;
  if (lower.includes("prun") || v.includes("කප්පාදු")) return "garden_pruned";
  if (lower.includes("fert") || v.includes("පොහොර")) return "fertilizer_issue";
  if (lower.includes("transport") || v.includes("ප්‍රවාහන")) return "transport_issue";
  if (lower.includes("contact") || v.includes("සම්බන්ධ")) return "cannot_be_contacted";
  return lower.replace(/\s+/g, "_");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const status = searchParams.get("status") || "all";

    const db = await getMongo();
    let all = await db.collection("suppliers").find({}).sort({ createdAt: -1 }).toArray();

    if (status !== "all") {
      all = all.filter((s: any) => (s.status || "active") === status);
    }
    if (search) {
      all = all.filter(
        (s: any) =>
          s.supplierNo?.toLowerCase().includes(search) ||
          s.name?.toLowerCase().includes(search) ||
          (s.phone && s.phone.toLowerCase().includes(search)) ||
          (s.nic && s.nic.toLowerCase().includes(search)) ||
          (s.route && s.route.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ success: true, suppliers: all });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getMongo();

    /* ---------------- BULK IMPORT (Excel / CSV extracted rows) ---------------- */
    if (Array.isArray(body.items)) {
      let imported = 0;
      let skipped = 0;
      const defaultStatus = body.defaultStatus === "inactive" ? "inactive" : "active";
      const today = new Date().toISOString().split("T")[0];

      for (const raw of body.items) {
        const supplierNo = String(raw.supplierNo || "").trim();
        const name = String(raw.name || "").trim();
        if (!supplierNo || !name) {
          skipped++;
          continue;
        }

        const reason = normalizeReason(raw.previousReason);
        const record = {
          supplierNo,
          name,
          phone: raw.phone ? String(raw.phone).trim() : null,
          nic: raw.nic ? String(raw.nic).trim() : null,
          route: raw.route ? String(raw.route).trim().toUpperCase() : null,
          factory: raw.factory ? String(raw.factory).trim() : null,
          previousReason: reason,
          lastWeightKg: raw.lastWeightKg ? String(raw.lastWeightKg) : "0",
          status: raw.status
            ? String(raw.status)
            : reason === "garden_pruned"
              ? "inactive"
              : defaultStatus,
          prunedDate:
            raw.prunedDate && String(raw.prunedDate).trim()
              ? String(raw.prunedDate).trim()
              : reason === "garden_pruned"
                ? today
                : null,
        };

        const existing = await db.collection("suppliers").findOne({ supplierNo });
        if (existing) {
          await db
            .collection("suppliers")
            .updateOne({ supplierNo }, { $set: { ...record, resolvedAt: null } });
        } else {
          await db
            .collection("suppliers")
            .insertOne({ id: raw.id || newId("sup"), ...record, resolvedAt: null, createdAt: new Date() } as any);
        }
        imported++;
      }

      return NextResponse.json({ success: true, imported, skipped });
    }

    /* ---------------- SINGLE UPSERT ---------------- */
    const {
      supplierNo,
      name,
      phone,
      nic,
      route,
      factory,
      previousReason,
      lastWeightKg,
      status,
      prunedDate,
      resolvedAt,
    } = body;

    if (!supplierNo || !name) {
      return NextResponse.json(
        { success: false, message: "සැපයුම්කරු අංකය සහ නම අනිවාර්යයි (Supplier No and Name required)" },
        { status: 400 }
      );
    }

    const newSupplier = {
      supplierNo: String(supplierNo).trim(),
      name: String(name).trim(),
      phone: phone?.trim() || null,
      nic: nic?.trim() || null,
      route: route?.trim() || null,
      factory: factory?.trim() || null,
      previousReason: normalizeReason(previousReason),
      lastWeightKg: lastWeightKg?.trim() || "0",
      status: status || "active",
      prunedDate: prunedDate || null,
      resolvedAt: resolvedAt || null,
    };

    const existing = await db.collection("suppliers").findOne({ supplierNo: newSupplier.supplierNo });
    if (existing) {
      await db
        .collection("suppliers")
        .updateOne({ supplierNo: newSupplier.supplierNo }, { $set: newSupplier });
    } else {
      await db
        .collection("suppliers")
        .insertOne({ id: body.id || newId("sup"), ...newSupplier, createdAt: new Date() } as any);
    }

    return NextResponse.json({ success: true, supplier: { id: body.id || existing?.id, ...newSupplier } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
