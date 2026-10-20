import { db } from "./index";
import { routes, suppliers, entries } from "./schema";
import { FACTORY_ROUTES, slugify } from "./factoryRoutes";
import { eq } from "drizzle-orm";

export async function migrateRoutes() {
  console.log("Replacing routes with factory->route mapping...");

  // 1. Wipe existing routes and insert the official mapping
  await db.delete(routes);
  let count = 0;
  for (const [factory, list] of Object.entries(FACTORY_ROUTES)) {
    for (const name of list) {
      await db
        .insert(routes)
        .values({ id: `route-${slugify(factory)}__${slugify(name)}`, name, factory })
        .onConflictDoNothing();
      count++;
    }
  }
  console.log("Routes inserted:", count);

  // 2. Build route -> first factory lookup
  const routeFactory: Record<string, string> = {};
  for (const [factory, list] of Object.entries(FACTORY_ROUTES)) {
    for (const n of list) {
      if (!routeFactory[n]) routeFactory[n] = factory;
    }
  }

  // 3. Fix supplier route spellings + factory assignment
  const sups = await db.select().from(suppliers);
  for (const s of sups) {
    let route = s.route || undefined;
    if (route === "GILIMALE") route = "GILMALE";
    if (route === "LELLOPITIYA") route = "LELLOPITYA";
    if (route === "GURUBEVILAGAMA") route = "GURUBEVILLAGAMA";
    if (route === "JANAPADATA") route = "JANAPADAYA";
    const factory = route ? routeFactory[route] : undefined;
    const patch: Record<string, string> = {};
    if (route && route !== s.route) patch.route = route;
    if (factory && factory !== s.factory) patch.factory = factory;
    if (Object.keys(patch).length > 0) {
      await db.update(suppliers).set(patch).where(eq(suppliers.id, s.id));
      console.log(`Supplier ${s.supplierNo} updated:`, patch);
    }
  }

  // 4. Fix entry factory so it matches the route's factory list
  const ens = await db.select().from(entries);
  for (const e of ens) {
    if (!e.route) continue;
    const factoriesForRoute = Object.entries(FACTORY_ROUTES)
      .filter(([, list]) => list.includes(e.route as string))
      .map(([f]) => f);
    if (factoriesForRoute.length > 0 && e.factory && !factoriesForRoute.includes(e.factory)) {
      await db
        .update(entries)
        .set({ factory: factoriesForRoute[0] })
        .where(eq(entries.id, e.id));
      console.log(`Entry ${e.id} factory fixed: ${e.factory} -> ${factoriesForRoute[0]}`);
    }
  }

  console.log("Route migration complete.");
}

if (require.main === module) {
  migrateRoutes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
