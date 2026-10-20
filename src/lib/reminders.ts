import { Supplier, Entry } from "@/types";

/** Days a pruned tea garden typically needs before leaf flow resumes. */
export const RECOVERY_DAYS = 90;

export type ReminderStage = "pruned" | "overdue";

export interface PruningReminder {
  id: string;
  supplierId: string;
  supplierNo: string;
  name: string;
  route?: string | null;
  factory?: string | null;
  stage: ReminderStage;
  prunedDate: string;
  recoveryDate: string;
  daysLeft: number; // >0 while waiting, <=0 once overdue (absolute value = days over)
  message: string;
}

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const daysBetween = (fromStr: string, toStr: string): number =>
  Math.round(
    (new Date(toStr + "T00:00:00").getTime() - new Date(fromStr + "T00:00:00").getTime()) / 86400000
  );

/**
 * Smart reminder engine:
 *
 *  Stage 1 ("pruned")  — a supplier's garden was pruned (කප්පාදු කැපීම).
 *                        Leaves are expected again around prunedDate + 90 days.
 *                        The admin sees a countdown reminder.
 *
 *  Stage 2 ("overdue") — the recovery window has passed but NO leaf supply
 *                        (willGive Yes / provides_leaves) was recorded since
 *                        pruning, and no admin has resolved it.
 *                        The admin sees an urgent "inactive — investigate" alert.
 *
 * Pruning dates come from either the admin directory (imported prunedDate) or
 * from field submissions whose reason = garden_pruned (server hook keeps the
 * directory in sync, but we also scan entries as a safety net).
 */
export function computePruningReminders(
  suppliers: Supplier[],
  entries: Entry[],
  todayStr?: string
): PruningReminder[] {
  const today = todayStr || new Date().toISOString().split("T")[0];
  const reminders: PruningReminder[] = [];

  for (const s of suppliers) {
    // Latest pruning evidence: directory field first, then field submissions
    const pruningEntries = entries.filter(
      (e) => e.supplierNo === s.supplierNo && e.promiseReason === "garden_pruned"
    );
    const latestPruningEntryDate = pruningEntries.length
      ? pruningEntries.map((e) => e.date).sort().pop()
      : undefined;

    const prunedDate = s.prunedDate || latestPruningEntryDate;
    const isPrunedReason = (s.previousReason || "") === "garden_pruned";

    if (!prunedDate && !isPrunedReason) continue;
    if (!prunedDate) continue;

    // Already resolved after the pruning event?
    if (s.resolvedAt && s.resolvedAt >= prunedDate) continue;

    // Any leaf supply recorded since pruning? (recovered → no reminder)
    const hasSupplySince = entries.some(
      (e) =>
        e.supplierNo === s.supplierNo &&
        e.date >= prunedDate &&
        (e.willGive === "ඔව් (Yes)" || e.promiseReason === "provides_leaves")
    );
    if (hasSupplySince) continue;

    const recoveryDate = addDays(prunedDate, RECOVERY_DAYS);
    const daysLeft = daysBetween(today, recoveryDate); // positive = still waiting

    if (daysLeft > 0) {
      reminders.push({
        id: `rem-pruned-${s.id}`,
        supplierId: s.id,
        supplierNo: s.supplierNo,
        name: s.name,
        route: s.route,
        factory: s.factory,
        stage: "pruned",
        prunedDate,
        recoveryDate,
        daysLeft,
        message: `වත්ත කප්පාදු කර ඇත (${prunedDate}). දළු නැවත ලැබිය හැකි කාලය ~${recoveryDate} (දින ${daysLeft} කින්). එතෙක් දළු නොලැබීම සාමාන්‍යයි.`,
      });
    } else {
      reminders.push({
        id: `rem-overdue-${s.id}`,
        supplierId: s.id,
        supplierNo: s.supplierNo,
        name: s.name,
        route: s.route,
        factory: s.factory,
        stage: "overdue",
        prunedDate,
        recoveryDate,
        daysLeft,
        message: `ප්‍රාප්ති කාලය (${recoveryDate}) ගෙවී දින ${Math.abs(daysLeft)} ක් වුවද තවම දළු සැපයුමක් නොමැත — මෙම සැපයුම්කරු අක්‍රියයි, කරුණාකර සොයා බලන්න (field visit required).`,
      });
    }
  }

  // Urgent (overdue) first, then nearest recovery dates
  return reminders.sort((a, b) => {
    if (a.stage !== b.stage) return a.stage === "overdue" ? -1 : 1;
    return a.daysLeft - b.daysLeft;
  });
}
