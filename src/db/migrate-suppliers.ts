import { db } from "./index";
import { suppliers } from "./schema";
import { eq } from "drizzle-orm";

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];

export async function migrateSuppliersDemo() {
  console.log("Applying supplier status / pruning demo data...");

  // 1540: pruned ~100 days ago → recovery window passed → OVERDUE reminder demo
  await db
    .update(suppliers)
    .set({ status: "inactive", prunedDate: daysAgo(100), previousReason: "garden_pruned", lastWeightKg: "0" })
    .where(eq(suppliers.supplierNo, "1540"));

  // 1541: freshly pruned (12 days ago) → STAGE-1 countdown reminder demo
  const existing = await db.select().from(suppliers).where(eq(suppliers.supplierNo, "1541"));
  if (existing.length === 0) {
    await db.insert(suppliers).values({
      id: "sup-1541",
      supplierNo: "1541",
      name: "U.K. Somawathi",
      phone: "0762211445",
      nic: "771234568V",
      route: "BALAWANA",
      factory: "Galpadihenna Tea Factory",
      previousReason: "garden_pruned",
      lastWeightKg: "0",
      status: "inactive",
      prunedDate: daysAgo(12),
    });
  } else {
    await db
      .update(suppliers)
      .set({ status: "inactive", prunedDate: daysAgo(12), previousReason: "garden_pruned" })
      .where(eq(suppliers.supplierNo, "1541"));
  }

  // 1024: inactive (fertilizer issue) but recently visited → coverage "visited" demo
  await db
    .update(suppliers)
    .set({ status: "inactive" })
    .where(eq(suppliers.supplierNo, "1024"));

  console.log("Supplier demo migration complete.");
}

if (require.main === module) {
  migrateSuppliersDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
