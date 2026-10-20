import type { Db } from "mongodb";
import { FACTORY_ROUTES, slugify } from "./factoryRoutes";

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
const now = () => new Date();

/* ------------------------------------------------------------------ */
/* USERS — includes the requested SUPER ADMIN account                 */
/* ------------------------------------------------------------------ */
const USERS = [
  {
    id: "u-1",
    employeeId: "akashperera@kdu.com",
    name: "Akash Perera",
    role: "admin",
    assignedRoute: "ALL",
    password: "akash123*#",
    createdAt: now(),
  },
  {
    id: "u-2",
    employeeId: "admin",
    name: "KDU Senior Manager",
    role: "admin",
    assignedRoute: "ALL",
    password: "admin",
    createdAt: now(),
  },
  { id: "u-3", employeeId: "Nandima", name: "Nandima Gunaratne", role: "collector", assignedRoute: "OLUGALA", password: "123", createdAt: now() },
  { id: "u-4", employeeId: "Collector_1", name: "Saman Kumara", role: "collector", assignedRoute: "GONAKUMBURA", password: "123", createdAt: now() },
  { id: "u-5", employeeId: "Sunil", name: "Sunil Bandara", role: "collector", assignedRoute: "FACTORY", password: "123", createdAt: now() },
  { id: "u-6", employeeId: "Pradeep", name: "Pradeep Alwis", role: "collector", assignedRoute: "WEWELWATTA", password: "123", createdAt: now() },
];

const REASONS = [
  { id: "provides_leaves", labelSi: "දළු ලබාදේ", labelEn: "Provides leaves", badgeColor: "#10B981", createdAt: now() },
  { id: "fertilizer_issue", labelSi: "පොහොර ගැටලුවක්", labelEn: "Fertilizer issue", badgeColor: "#F59E0B", createdAt: now() },
  { id: "low_leaf_amount", labelSi: "දළු ප්‍රමාණය අඩුයි", labelEn: "Low amount of leaves", badgeColor: "#3B82F6", createdAt: now() },
  { id: "given_to_another_book", labelSi: "වෙනත් පොතකට ලබාදේ", labelEn: "Given to another book", badgeColor: "#8B5CF6", createdAt: now() },
  { id: "cannot_be_contacted", labelSi: "සම්බන්ධ කරගත නොහැක", labelEn: "Cannot be contacted", badgeColor: "#6B7280", createdAt: now() },
  { id: "garden_pruned", labelSi: "වත්ත කප්පාදු කර ඇත", labelEn: "Garden has been pruned", badgeColor: "#EC4899", createdAt: now() },
  { id: "not_registered", labelSi: "ලියාපදිංචි වී නොමැත", labelEn: "Not registered", badgeColor: "#EF4444", createdAt: now() },
  { id: "personal_reason", labelSi: "පෞද්ගලික හේතුවක්", labelEn: "Personal reason", badgeColor: "#F97316", createdAt: now() },
  { id: "transport_issue", labelSi: "ප්‍රවාහන ගැටලුවක්", labelEn: "Transport issue", badgeColor: "#14B8A6", createdAt: now() },
];

const SUPPLIERS = [
  { id: "sup-1", supplierNo: "635", name: "O.K.C.P. KUMARA", phone: "0771234567", nic: "880430840V", route: "OLUGALA", factory: "Galpadihenna Tea Factory", previousReason: "provides_leaves", lastWeightKg: "145.5", status: "active", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-2", supplierNo: "1024", name: "P.G. Sunil Shantha", phone: "0714589632", nic: "792140523V", route: "GONAKUMBURA", factory: "Galpadihenna Tea Factory", previousReason: "fertilizer_issue", lastWeightKg: "85.0", status: "inactive", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-3", supplierNo: "802", name: "M.W. Jayawardena", phone: "0702345678", nic: "841258963V", route: "FACTORY", factory: "Galpadihenna Tea Factory", previousReason: "provides_leaves", lastWeightKg: "320.0", status: "active", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-4", supplierNo: "1540", name: "K.L. Wasantha Kumara", phone: "0778945612", nic: "902345612V", route: "BALAWATHUKANDA", factory: "Kalawana Leaf Center", previousReason: "garden_pruned", lastWeightKg: "0.0", status: "inactive", prunedDate: daysAgo(100), resolvedAt: null, createdAt: now() },
  { id: "sup-5", supplierNo: "420", name: "H.A. Dharmasena", phone: "0765412398", nic: "681245789V", route: "RAKWANA", factory: "Madampe Tea Factory", previousReason: "low_leaf_amount", lastWeightKg: "45.2", status: "active", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-6", supplierNo: "915", name: "S.M. Rohini Wickramasinghe", phone: "0723654189", nic: "756412895V", route: "WEWELWATTA", factory: "Galpadihenna Tea Factory", previousReason: "provides_leaves", lastWeightKg: "210.8", status: "active", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-7", supplierNo: "112", name: "A.G. Chandrasiri", phone: "0789654123", nic: "631245987V", route: "KALAWANA", factory: "Galpadihenna Tea Factory", previousReason: "transport_issue", lastWeightKg: "175.4", status: "active", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-8", supplierNo: "2301", name: "B.M. Priyantha", phone: "0756321478", nic: "931254789V", route: "SL_AYAGAMA", factory: "Matuwagala Tea Factory", previousReason: "provides_leaves", lastWeightKg: "412.0", status: "active", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-9", supplierNo: "305", name: "Gamini Seneviratne", phone: "0718899221", nic: "721980345V", route: "PANAGAMA", factory: "Galpadihenna Tea Factory", previousReason: "provides_leaves", lastWeightKg: "285.5", status: "active", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-10", supplierNo: "770", name: "Chandani Dissanayake", phone: "0773344556", nic: "836541298V", route: "GILMALE", factory: "Galpadihenna Tea Factory", previousReason: "personal_reason", lastWeightKg: "60.0", status: "active", prunedDate: null, resolvedAt: null, createdAt: now() },
  { id: "sup-11", supplierNo: "1541", name: "U.K. Somawathi", phone: "0762211445", nic: "771234568V", route: "BALAWANA", factory: "Galpadihenna Tea Factory", previousReason: "garden_pruned", lastWeightKg: "0", status: "inactive", prunedDate: daysAgo(12), resolvedAt: null, createdAt: now() },
];

const QUESTIONS = [
  { id: "q-1", title: "වගා බිමේ මුළු ප්‍රමාණය (අක්කර) - Total Land Extent (Acres)", targetForm: "both", inputType: "number", options: "", createdAt: now() },
  { id: "q-2", title: "දළු නෙලීමේ වාර ගණන - Plucking Frequency", targetForm: "inactive", inputType: "dropdown", options: "වරක් (Once),දෙවරක් (Twice),තුන්වරක් (Thrice)", createdAt: now() },
  { id: "q-3", title: "කාබනික පොහොර භාවිතය - Organic Fertilizer Usage", targetForm: "extension", inputType: "boolean", options: "", createdAt: now() },
];

const ENTRIES = [
  {
    id: "entry-1", collectorId: "Nandima Gunaratne", date: daysAgo(0), time: "09:30:15", gpsLocation: "6.6828, 80.4032", gpsAccuracy: "precise", type: "inactive", factory: "Galpadihenna Tea Factory", route: "OLUGALA", supplierNo: "635", supplierName: "O.K.C.P. KUMARA", nic: "880430840V", phoneNumber: "0771234567", willGive: "ඔව් (Yes)", promiseReason: "provides_leaves", couldNotMeet: false, actionsTaken: "පොහොර සහනාධාරය පිළිබඳව දැනුවත් කරන ලදී.", permWorkerName: "සුනිල් රත්නායක", permWorkerGender: "පුරුෂ (Male)", permWorkerBirthYear: "1984", permWorkerWages: "2500", tempWorkersCount: "2", salesVolumeKg: "145.5", salesVolumeDate: daysAgo(1), supplierType: "පැරණි සැපයුම්කරු (Old Supplier)", address: "නො. 45, ඔලුගල, රත්නපුර", expectedLeafQty: "150", suggestions: "දළු එකතු කිරීමේ වේලාව උදෑසන 10 ට පෙර සිදුකරන්න.", routeProblems: "පාලම අසල මාර්ගය අබලන් වී ඇත.", comments: "වත්තේ තත්ත්වය ඉතා සතුටුදායකයි.", raNoDeforestation: "නැත (No)", raRiparianBuffer: "ඔව් (Yes)", raNoWasteBurning: "නැත (No)", raRainwaterHarvesting: "ඔව් (Yes)", raSoilErosion: "ඔව් (Yes)", raWildlifeProtection: "ඔව් (Yes)", customFieldsJson: JSON.stringify({ "q-1": "2.5", "q-2": "දෙවරක් (Twice)" }), createdAt: now(),
  },
  {
    id: "entry-2", collectorId: "Saman Kumara", date: daysAgo(0), time: "11:15:40", gpsLocation: "6.6712, 80.4215", gpsAccuracy: "precise", type: "inactive", factory: "Galpadihenna Tea Factory", route: "GONAKUMBURA", supplierNo: "1024", supplierName: "P.G. Sunil Shantha", nic: "792140523V", phoneNumber: "0714589632", willGive: "නැත (No)", promiseReason: "fertilizer_issue", couldNotMeet: false, actionsTaken: "පොහොර ලබාදීමේ නව ක්‍රමවේදය පැහැදිලි කරන ලදී.", permWorkerName: "කමලා ද සිල්වා", permWorkerGender: "ස්ත්‍රී (Female)", permWorkerBirthYear: "1988", permWorkerWages: "2200", tempWorkersCount: "1", salesVolumeKg: "85.0", salesVolumeDate: daysAgo(2), supplierType: "පැරණි සැපයුම්කරු (Old Supplier)", address: "ගෝනකුඹුර", expectedLeafQty: "80", suggestions: "පොහොර සහනාධාර වේගවත් කරන්න.", routeProblems: "වැසි දිනවල ලොරි රථය පැමිණීමට අපහසුයි.", comments: "පොහොර නොමැතිකමින් දළු අස්වැන්න පහත වැටී ඇත.", raNoDeforestation: "නැත (No)", raRiparianBuffer: "ඔව් (Yes)", raNoWasteBurning: "නැත (No)", raRainwaterHarvesting: "නැත (No)", raSoilErosion: "ඔව් (Yes)", raWildlifeProtection: "ඔව් (Yes)", customFieldsJson: JSON.stringify({ "q-1": "1.8", "q-2": "වරක් (Once)" }), createdAt: now(),
  },
  {
    id: "entry-3", collectorId: "Akash Perera", date: daysAgo(0), time: "14:20:05", gpsLocation: "6.6954, 80.3891", gpsAccuracy: "precise", type: "extension", factory: "Galpadihenna Tea Factory", route: "OLUGALA", supplierNo: "NEW-084", supplierName: "ඩී. ජයලත් මහතා (D. Jayalath)", nic: "851478963V", phoneNumber: "0778899001", willGive: "ඔව් (Yes)", promiseReason: "provides_leaves", couldNotMeet: false, actionsTaken: "නව සැපයුම්කරු ලියාපදිංචි කිරීම සම්පූර්ණ කරන ලදී.", permWorkerName: "මහින්ද බණ්ඩාර", permWorkerGender: "පුරුෂ (Male)", permWorkerBirthYear: "1990", permWorkerWages: "2600", tempWorkersCount: "4", salesVolumeKg: "0", salesVolumeDate: "", supplierType: "නව සැපයුම්කරු (New Supplier)", address: "කන්දේහේන, ඔලුගල", expectedLeafQty: "350", suggestions: "පළමු වටයේදී පොත් සහ මලු ලබාදෙන්න.", routeProblems: "ප්‍රධාන මාර්ගය තාර දමා නැත.", comments: "RA සහතිකයට අවශ්‍ය නිර්ණායක සපුරා ඇත.", raNoDeforestation: "නැත (No)", raRiparianBuffer: "ඔව් (Yes)", raNoWasteBurning: "නැත (No)", raRainwaterHarvesting: "ඔව් (Yes)", raSoilErosion: "ඔව් (Yes)", raWildlifeProtection: "ඔව් (Yes)", customFieldsJson: JSON.stringify({ "q-1": "3.5", "q-3": "ඔව් (Yes)" }), createdAt: now(),
  },
  {
    id: "entry-4", collectorId: "Sunil Bandara", date: daysAgo(1), time: "10:45:10", gpsLocation: "6.7112, 80.4521", gpsAccuracy: "precise", type: "inactive", factory: "Galpadihenna Tea Factory", route: "FACTORY", supplierNo: "802", supplierName: "M.W. Jayawardena", nic: "841258963V", phoneNumber: "0702345678", willGive: "ඔව් (Yes)", promiseReason: "provides_leaves", couldNotMeet: false, actionsTaken: "සාමාන්‍ය නිරීක්ෂණ චාරිකාවකි.", permWorkerName: "නවරත්න", permWorkerGender: "පුරුෂ (Male)", permWorkerBirthYear: "1980", permWorkerWages: "2500", tempWorkersCount: "3", salesVolumeKg: "320.0", salesVolumeDate: daysAgo(2), supplierType: "පැරණි සැපයුම්කරු (Old Supplier)", address: "කුට්ටපිටිය පාර", expectedLeafQty: "320", suggestions: "දළු කිරුම් කටයුතු නිසි වේලාවට සිදුකරන්න.", routeProblems: "කිසිදු ගැටළුවක් නැත.", comments: "විශිෂ්ට තත්ත්වයේ දළු සපයයි.", raNoDeforestation: "නැත (No)", raRiparianBuffer: "ඔව් (Yes)", raNoWasteBurning: "නැත (No)", raRainwaterHarvesting: "ඔව් (Yes)", raSoilErosion: "ඔව් (Yes)", raWildlifeProtection: "ඔව් (Yes)", customFieldsJson: JSON.stringify({ "q-1": "4.0", "q-2": "තුන්වරක් (Thrice)" }), createdAt: now(),
  },
  {
    id: "entry-5", collectorId: "Pradeep Alwis", date: daysAgo(3), time: "15:10:22", gpsLocation: "6.6432, 80.4912", gpsAccuracy: "fallback", type: "inactive", factory: "Kalawana Leaf Center", route: "BALAWATHUKANDA", supplierNo: "1540", supplierName: "K.L. Wasantha Kumara", nic: "902345612V", phoneNumber: "0778945612", willGive: "නැත (No)", promiseReason: "garden_pruned", couldNotMeet: false, actionsTaken: "වත්ත කප්පාදු කර ඇති බැවින් මාස දෙකකින් නැවත පැමිණීමට දින නියම කරගන්නා ලදී.", permWorkerName: "", permWorkerGender: "", permWorkerBirthYear: "", permWorkerWages: "", tempWorkersCount: "0", salesVolumeKg: "0", salesVolumeDate: "", supplierType: "පැරණි සැපයුම්කරු (Old Supplier)", address: "බලවතුකන්ද, මැදම්පේ", expectedLeafQty: "0", suggestions: "කප්පාදු පොහොර ලබාදීමට කටයුතු කරන්න.", routeProblems: "නැත", comments: "කප්පාදු කටයුතු ඉතා ක්‍රමානුකූලව සිදුකර ඇත.", raNoDeforestation: "නැත (No)", raRiparianBuffer: "ඔව් (Yes)", raNoWasteBurning: "නැත (No)", raRainwaterHarvesting: "ඔව් (Yes)", raSoilErosion: "ඔව් (Yes)", raWildlifeProtection: "ඔව් (Yes)", customFieldsJson: JSON.stringify({ "q-1": "1.2" }), createdAt: now(),
  },
  {
    id: "entry-6", collectorId: "Nandima Gunaratne", date: daysAgo(4), time: "08:50:30", gpsLocation: "6.6543, 80.4611", gpsAccuracy: "precise", type: "extension", factory: "Galpadihenna Tea Factory", route: "WEWELWATTA", supplierNo: "915", supplierName: "S.M. Rohini Wickramasinghe", nic: "756412895V", phoneNumber: "0723654189", willGive: "ඔව් (Yes)", promiseReason: "provides_leaves", couldNotMeet: false, actionsTaken: "Rainforest Alliance (RA) සහතිකකරණ නිරීක්ෂණය සිදුකරන ලදී.", permWorkerName: "චන්ද්‍රලතා", permWorkerGender: "ස්ත්‍රී (Female)", permWorkerBirthYear: "1986", permWorkerWages: "2300", tempWorkersCount: "2", salesVolumeKg: "210.8", salesVolumeDate: daysAgo(5), supplierType: "පැරණි සැපයුම්කරු (Old Supplier)", address: "වැවේල්වත්ත පාර", expectedLeafQty: "250", suggestions: "ජල මූලාශ්‍ර ආරක්ෂිත කලාපය පුළුල් කිරීම.", routeProblems: "කිසිදු ගැටළුවක් නැත.", comments: "පරිසර හිතකාමී ක්‍රමවේද අනුගමනය කෙරේ.", raNoDeforestation: "නැත (No)", raRiparianBuffer: "ඔව් (Yes)", raNoWasteBurning: "නැත (No)", raRainwaterHarvesting: "ඔව් (Yes)", raSoilErosion: "ඔව් (Yes)", raWildlifeProtection: "ඔව් (Yes)", customFieldsJson: JSON.stringify({ "q-1": "2.0", "q-3": "ඔව් (Yes)" }), createdAt: now(),
  },
];

const routeDocs = Object.entries(FACTORY_ROUTES).flatMap(([factory, list]) =>
  list.map((name) => ({
    id: `route-${slugify(factory)}__${slugify(name)}`,
    name,
    factory,
    createdAt: now(),
  }))
);

/** Seeds empty collections only — safe to call on every boot. */
export async function ensureSeed(db: Db): Promise<void> {
  const count = (name: string) => db.collection(name).countDocuments();

  if ((await count("routes")) === 0) {
    await db.collection("routes").insertMany(routeDocs as any);
    console.log("[mongo-seed] routes:", routeDocs.length);
  }
  if ((await count("status_reasons")) === 0) {
    await db.collection("status_reasons").insertMany(REASONS as any);
    console.log("[mongo-seed] reasons:", REASONS.length);
  }
  if ((await count("users")) === 0) {
    await db.collection("users").insertMany(USERS as any);
    console.log("[mongo-seed] users:", USERS.length, "(superadmin: akashperera@kdu.com)");
  }
  if ((await count("suppliers")) === 0) {
    await db.collection("suppliers").insertMany(SUPPLIERS as any);
    console.log("[mongo-seed] suppliers:", SUPPLIERS.length);
  }
  if ((await count("custom_questions")) === 0) {
    await db.collection("custom_questions").insertMany(QUESTIONS as any);
    console.log("[mongo-seed] questions:", QUESTIONS.length);
  }
  if ((await count("entries")) === 0) {
    await db.collection("entries").insertMany(ENTRIES as any);
    console.log("[mongo-seed] entries:", ENTRIES.length);
  }
}
