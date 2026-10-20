import { NextResponse } from "next/server";
import type { Db } from "mongodb";
import { getMongo, newId } from "@/db/mongo";

export const dynamic = "force-dynamic";

/**
 * Pruning reminder hook:
 * When a field officer records reason = garden_pruned (කප්පාදු කැපීම),
 * the supplier directory is updated so the admin reminder engine can track
 * the recovery window (prunedDate) and raise follow-up notifications.
 */
async function applyPruningHook(
  db: Db,
  record: {
    supplierNo?: string | null;
    supplierName?: string | null;
    phoneNumber?: string | null;
    nic?: string | null;
    route?: string | null;
    factory?: string | null;
    promiseReason?: string | null;
    salesVolumeKg?: string | null;
    date?: string | null;
  }
) {
  if (record.promiseReason !== "garden_pruned" || !record.supplierNo) return;
  try {
    const today = record.date || new Date().toISOString().split("T")[0];
    const existing = await db.collection("suppliers").findOne({ supplierNo: record.supplierNo });

    if (existing) {
      await db.collection("suppliers").updateOne(
        { supplierNo: record.supplierNo },
        {
          $set: {
            prunedDate: today,
            status: "inactive",
            resolvedAt: null,
            previousReason: "garden_pruned",
          },
        }
      );
    } else {
      await db.collection("suppliers").insertOne({
        id: newId("sup"),
        supplierNo: record.supplierNo,
        name: record.supplierName || `Supplier ${record.supplierNo}`,
        phone: record.phoneNumber || null,
        nic: record.nic || null,
        route: record.route || null,
        factory: record.factory || null,
        previousReason: "garden_pruned",
        lastWeightKg: record.salesVolumeKg || "0",
        status: "inactive",
        prunedDate: today,
        resolvedAt: null,
        createdAt: new Date(),
      } as any);
    }
  } catch (err) {
    console.error("Pruning hook error:", err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "all";
    const collector = searchParams.get("collector") || "all";
    const route = searchParams.get("route") || "all";
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    const db = await getMongo();
    const allEntries = await db
      .collection("entries")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const todayStr = new Date().toISOString().split("T")[0];
    const sevenDaysAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const currentMonthPrefix = todayStr.substring(0, 7);

    const filtered = allEntries.filter((item: any) => {
      if (range === "today" && item.date !== todayStr) return false;
      if (range === "7days" && item.date < sevenDaysAgoStr) return false;
      if (range === "month" && !item.date?.startsWith(currentMonthPrefix)) return false;
      if (collector !== "all" && item.collectorId !== collector) return false;
      if (route !== "all" && item.route !== route) return false;
      if (type !== "all" && item.type !== type) return false;

      if (search) {
        const matchSearch =
          (item.supplierName && item.supplierName.toLowerCase().includes(search)) ||
          (item.supplierNo && item.supplierNo.toLowerCase().includes(search)) ||
          (item.route && item.route.toLowerCase().includes(search)) ||
          (item.nic && item.nic.toLowerCase().includes(search)) ||
          (item.phoneNumber && item.phoneNumber.toLowerCase().includes(search)) ||
          (item.collectorId && item.collectorId.toLowerCase().includes(search));
        if (!matchSearch) return false;
      }
      return true;
    });

    return NextResponse.json({
      success: true,
      entries: filtered,
      totalCount: allEntries.length,
      filteredCount: filtered.length,
    });
  } catch (error: any) {
    console.error("GET entries error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getMongo();

    /* ---------------- batch sync (offline queue) ---------------- */
    if (Array.isArray(body.items)) {
      const inserted = [];
      for (const item of body.items) {
        const id = item.id || newId("entry");
        const record = {
          id,
          collectorId: item.collectorId || "Unknown Collector",
          date: item.date || new Date().toISOString().split("T")[0],
          time: item.time || new Date().toTimeString().split(" ")[0],
          gpsLocation: item.gpsLocation || null,
          gpsAccuracy: item.gpsAccuracy || null,
          type: item.type || "inactive",
          factory: item.factory || null,
          route: item.route || null,
          supplierNo: item.supplierNo || null,
          supplierName: item.supplierName || "Unknown",
          nic: item.nic || null,
          phoneNumber: item.phoneNumber || null,
          willGive: item.willGive || null,
          promiseReason: item.promiseReason || null,
          couldNotMeet: Boolean(item.couldNotMeet),
          actionsTaken: item.actionsTaken || null,
          permWorkerName: item.permWorkerName || null,
          permWorkerGender: item.permWorkerGender || null,
          permWorkerBirthYear: item.permWorkerBirthYear || null,
          permWorkerWages: item.permWorkerWages || null,
          tempWorkersCount: item.tempWorkersCount || null,
          salesVolumeKg: item.salesVolumeKg || null,
          salesVolumeDate: item.salesVolumeDate || null,
          supplierType: item.supplierType || null,
          address: item.address || null,
          expectedLeafQty: item.expectedLeafQty || null,
          suggestions: item.suggestions || null,
          routeProblems: item.routeProblems || null,
          comments: item.comments || null,
          raNoDeforestation: item.raNoDeforestation || null,
          raRiparianBuffer: item.raRiparianBuffer || null,
          raNoWasteBurning: item.raNoWasteBurning || null,
          raRainwaterHarvesting: item.raRainwaterHarvesting || null,
          raSoilErosion: item.raSoilErosion || null,
          raWildlifeProtection: item.raWildlifeProtection || null,
          customFieldsJson:
            typeof item.customFieldsJson === "object"
              ? JSON.stringify(item.customFieldsJson)
              : item.customFieldsJson || "{}",
          createdAt: new Date(),
        };

        await db
          .collection("entries")
          .updateOne({ id }, { $setOnInsert: record }, { upsert: true });
        await applyPruningHook(db, record);
        inserted.push(record);
      }

      return NextResponse.json({ success: true, count: inserted.length, items: inserted });
    }

    /* ---------------- single submission ---------------- */
    const id = body.id || newId("entry");
    const newEntry = {
      id,
      collectorId: body.collectorId || "Collector",
      date: body.date || new Date().toISOString().split("T")[0],
      time: body.time || new Date().toTimeString().split(" ")[0],
      gpsLocation: body.gpsLocation || null,
      gpsAccuracy: body.gpsAccuracy || null,
      type: body.type || "inactive",
      factory: body.factory || null,
      route: body.route || null,
      supplierNo: body.supplierNo || null,
      supplierName: body.supplierName || "නොදනී",
      nic: body.nic || null,
      phoneNumber: body.phoneNumber || null,
      willGive: body.willGive || null,
      promiseReason: body.promiseReason || null,
      couldNotMeet: Boolean(body.couldNotMeet),
      actionsTaken: body.actionsTaken || null,
      permWorkerName: body.permWorkerName || null,
      permWorkerGender: body.permWorkerGender || null,
      permWorkerBirthYear: body.permWorkerBirthYear || null,
      permWorkerWages: body.permWorkerWages || null,
      tempWorkersCount: body.tempWorkersCount || null,
      salesVolumeKg: body.salesVolumeKg || null,
      salesVolumeDate: body.salesVolumeDate || null,
      supplierType: body.supplierType || null,
      address: body.address || null,
      expectedLeafQty: body.expectedLeafQty || null,
      suggestions: body.suggestions || null,
      routeProblems: body.routeProblems || null,
      comments: body.comments || null,
      raNoDeforestation: body.raNoDeforestation || null,
      raRiparianBuffer: body.raRiparianBuffer || null,
      raNoWasteBurning: body.raNoWasteBurning || null,
      raRainwaterHarvesting: body.raRainwaterHarvesting || null,
      raSoilErosion: body.raSoilErosion || null,
      raWildlifeProtection: body.raWildlifeProtection || null,
      customFieldsJson:
        typeof body.customFieldsJson === "object"
          ? JSON.stringify(body.customFieldsJson)
          : body.customFieldsJson || "{}",
      createdAt: new Date(),
    };

    await db.collection("entries").insertOne(newEntry as any);
    await applyPruningHook(db, newEntry);

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error: any) {
    console.error("POST entry error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create entry" },
      { status: 500 }
    );
  }
}
