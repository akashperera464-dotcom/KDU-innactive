import * as XLSX from "xlsx";

/**
 * Parser for the OFFICE Excel format used by KDU factories, e.g.:
 *
 *   Row 1  : "MATUWAGALA TEA FACTORY"                      (factory title)
 *   Row 2  : "Previous Month Active but Current Month
 *             Inactive Suppliers - Current Month SEPTEMBER-2026"
 *   Row 22 : Route Name | Client Reg No | Name | Contact Number |
 *            Address | Total (Kg) | <status> | <remarks>
 *   Row 23+: data rows, interspersed with GREEN route subtotal rows
 *            ("BADUWATTA | # 8 | … | 93") which must be skipped.
 *
 * Also falls back to the simple generic CSV layout
 * (Supplier No, Name, Phone, NIC, Route, Factory, Reason, Weight).
 */

export const KNOWN_FACTORIES = [
  "Galpadihenna Tea Factory",
  "Kalawana Leaf Center",
  "Kuttapitiya Tea Factory",
  "Madampe Tea Factory",
  "Matuwagala Tea Factory",
  "Peak view Tea Factory",
];

export const KNOWN_REASON_IDS = [
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

/** Office status word → system reason id */
const OFFICE_STATUS_MAP: Record<string, string> = {
  ACTIVE: "provides_leaves",
  "WILL GIVE": "provides_leaves",
  "LOW LEAF AMOUNT": "low_leaf_amount",
  "LOW LEAF": "low_leaf_amount",
  "NOT CONNECTED": "cannot_be_contacted",
  "NOT CONNECT": "cannot_be_contacted",
  PRUNED: "garden_pruned",
  "HAVE TO PRUNE": "garden_pruned",
  "MORE BOOK": "given_to_another_book",
  "PERSONAL ISSUE": "personal_reason",
  "TRANSPORT ISSUE": "transport_issue",
  "NOT REGISTERED": "not_registered",
  "ESTATE SOLD": "estate_sold",
  "ESTATE LEASED": "estate_leased",
  "ESTATE LEASED OUT": "estate_leased",
};

export interface OfficeRow {
  supplierNo: string;
  name: string;
  phone: string;
  address: string;
  route: string;
  lastWeightKg: string;
  statusRaw: string;
  remarks: string;
}

export interface OfficeParseResult {
  format: "office" | "generic";
  factory: string | null;
  monthLabel: string | null;
  headerRow: number | null; // 1-based, for display
  rows: OfficeRow[];
  skipped: number;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());

export function mapOfficeStatus(raw: string): { reasonId: string | null; term: string } {
  const term = str(raw).toUpperCase().replace(/\s+/g, " ");
  if (!term) return { reasonId: null, term: "" };
  const low = str(raw).toLowerCase();
  if ((KNOWN_REASON_IDS as string[]).includes(low)) return { reasonId: low, term };
  if (OFFICE_STATUS_MAP[term]) return { reasonId: OFFICE_STATUS_MAP[term], term };
  for (const [k, v] of Object.entries(OFFICE_STATUS_MAP)) {
    if (term.includes(k)) return { reasonId: v, term };
  }
  return { reasonId: null, term }; // unknown → caller auto-creates a reason
}

export function parseOfficeWorkbook(buf: ArrayBuffer): OfficeParseResult {
  return parseWorkbook(XLSX.read(buf));
}

export function parseWorkbook(wb: XLSX.WorkBook): OfficeParseResult {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", raw: false });

  /* ---- factory + month from the top banner rows ---- */
  let factory: string | null = null;
  let monthLabel: string | null = null;
  for (const row of aoa.slice(0, 12)) {
    for (const cell of row) {
      const s = str(cell);
      if (!s) continue;
      if (!factory) {
        const up = s.toUpperCase();
        const hit = KNOWN_FACTORIES.find((f) => up.includes(f.toUpperCase()));
        if (hit) factory = hit;
      }
      if (!monthLabel) {
        const m = s.match(/current month\s*[:\-]?\s*([A-Z]{3,10}\s*-\s*\d{4})/i);
        if (m) monthLabel = m[1].replace(/\s+/g, " ").toUpperCase();
      }
    }
  }

  /* ---- locate the office header row ---- */
  let h = -1;
  let regCol = -1;
  for (let i = 0; i < Math.min(aoa.length, 60); i++) {
    const row = aoa[i] as unknown[];
    const idx = row.findIndex((c) => /client\s*reg|reg\s*no/i.test(str(c)));
    const hasRouteHdr = row.some((c) => /route\s*name/i.test(str(c)));
    if (idx >= 0 || (hasRouteHdr && row.some((c) => /^name$/i.test(str(c))))) {
      h = i;
      regCol = idx;
      break;
    }
  }

  /* ---- OFFICE FORMAT ---- */
  if (h >= 0) {
    const base = regCol >= 0 ? regCol : 2; // Client Reg No column (C by default)
    const cRoute = base - 1;
    const cNo = base;
    const cName = base + 1;
    const cPhone = base + 2;
    const cAddr = base + 4;
    const cWeight = base + 6;
    const cStatus = base + 8;
    const cRemarks = base + 9;

    const rows: OfficeRow[] = [];
    let skipped = 0;

    for (let i = h + 1; i < aoa.length; i++) {
      const r = (aoa[i] as unknown[]) || [];
      const supplierNo = str(r[cNo]);
      const name = str(r[cName]);
      // skip green subtotal rows ("# 8"), blank rows & route-only rows
      if (!supplierNo || supplierNo.startsWith("#") || !name) {
        skipped++;
        continue;
      }
      rows.push({
        supplierNo,
        name,
        phone: str(r[cPhone]),
        address: str(r[cAddr]),
        route: str(r[cRoute]).toUpperCase(),
        lastWeightKg: str(r[cWeight]).replace(/[^0-9.]/g, ""),
        statusRaw: str(r[cStatus]),
        remarks: str(r[cRemarks]),
      });
    }
    return { format: "office", factory, monthLabel, headerRow: h + 1, rows, skipped };
  }

  /* ---- GENERIC FALLBACK (simple CSV: header row with known keys) ---- */
  const KEY_MAP: { field: keyof OfficeRow | "nic" | "factory"; keys: string[] }[] = [
    { field: "supplierNo", keys: ["supplierno", "no", "number", "clientregno", "regno", "supplierid"] },
    { field: "name", keys: ["name", "suppliername", "fullname"] },
    { field: "phone", keys: ["phone", "phonenumber", "contactnumber", "contact", "telephone", "mobile"] },
    { field: "nic", keys: ["nic", "nicno", "idno"] },
    { field: "route", keys: ["route", "routename", "tearoute"] },
    { field: "factory", keys: ["factory", "factoryname"] },
    { field: "lastWeightKg", keys: ["weight", "lastweight", "lastweightkg", "kg", "total", "totalkg"] },
    { field: "statusRaw", keys: ["reason", "status", "previousreason", "adminreason"] },
    { field: "address", keys: ["address"] },
    { field: "remarks", keys: ["remarks", "notes", "comment", "comments"] },
  ];

  let gh = -1;
  let cols: Record<string, number> = {};
  for (let i = 0; i < Math.min(aoa.length, 20); i++) {
    const row = (aoa[i] as unknown[]).map(str);
    const found: Record<string, number> = {};
    let hits = 0;
    for (const { field, keys } of KEY_MAP) {
      const ci = row.findIndex((c) => keys.includes(slug(c)));
      if (ci >= 0) {
        found[field as string] = ci;
        hits++;
      }
    }
    if (hits >= 2) {
      gh = i;
      cols = found;
      break;
    }
  }

  const rows: OfficeRow[] = [];
  let skipped = 0;
  let genericFactory: string | null = factory;

  if (gh >= 0) {
    for (let i = gh + 1; i < aoa.length; i++) {
      const r = (aoa[i] as unknown[]) || [];
      const get = (f: string) => str(r[cols[f]]);
      const supplierNo = get("supplierNo");
      const name = get("name");
      if (!supplierNo || supplierNo.startsWith("#") || !name) {
        skipped++;
        continue;
      }
      const f = get("factory");
      if (f && !genericFactory) {
        const up = f.toUpperCase();
        genericFactory = KNOWN_FACTORIES.find((k) => up.includes(k.toUpperCase())) || f;
      }
      rows.push({
        supplierNo,
        name,
        phone: get("phone"),
        address: get("address"),
        route: get("route").toUpperCase(),
        lastWeightKg: get("lastWeightKg").replace(/[^0-9.]/g, ""),
        statusRaw: get("statusRaw"),
        remarks: get("remarks"),
      });
    }
  }

  return { format: "generic", factory: genericFactory, monthLabel, headerRow: gh >= 0 ? gh + 1 : null, rows, skipped };
}
