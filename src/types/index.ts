export interface Entry {
  id: string;
  collectorId: string;
  date: string;
  time: string;
  gpsLocation?: string | null;
  gpsAccuracy?: string | null; // 'precise' | 'fallback'
  type: "inactive" | "extension";
  factory?: string | null;
  route?: string | null;
  supplierNo?: string | null;
  supplierName: string;
  nic?: string | null;
  phoneNumber?: string | null;
  willGive?: string | null; // 'ඔව් (Yes)' | 'නැත (No)'
  promiseReason?: string | null;
  couldNotMeet?: boolean | null;
  actionsTaken?: string | null;
  permWorkerName?: string | null;
  permWorkerGender?: string | null;
  permWorkerBirthYear?: string | null;
  permWorkerWages?: string | null;
  tempWorkersCount?: string | null;
  salesVolumeKg?: string | null;
  salesVolumeDate?: string | null;
  supplierType?: string | null; // 'නව සැපයුම්කරු (New Supplier)' | 'පැරණි සැපයුම්කරු (Old Supplier)'
  address?: string | null;
  expectedLeafQty?: string | null;
  suggestions?: string | null;
  routeProblems?: string | null;
  comments?: string | null;
  raNoDeforestation?: string | null;
  raRiparianBuffer?: string | null;
  raNoWasteBurning?: string | null;
  raRainwaterHarvesting?: string | null;
  raSoilErosion?: string | null;
  raWildlifeProtection?: string | null;
  customFieldsJson?: string | null;
  createdAt?: string | Date | null;
  synced?: boolean;
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  role: "admin" | "collector";
  assignedRoute?: string | null;
  createdAt?: string | Date | null;
}

export interface Supplier {
  id: string;
  supplierNo: string;
  name: string;
  phone?: string | null;
  nic?: string | null;
  route?: string | null;
  factory?: string | null;
  previousReason?: string | null;
  lastWeightKg?: string | null;
  status?: string | null; // 'active' | 'inactive'
  prunedDate?: string | null; // YYYY-MM-DD garden pruned
  resolvedAt?: string | null; // YYYY-MM-DD reminder resolved
}

export interface RouteItem {
  id: string;
  name: string;
  factory?: string | null;
}

export interface StatusReasonItem {
  id: string;
  labelSi: string;
  labelEn: string;
  badgeColor?: string | null;
}

export interface CustomQuestionItem {
  id: string;
  title: string;
  targetForm: "inactive" | "extension" | "both";
  inputType: "text" | "number" | "dropdown" | "boolean";
  options?: string | null;
}
