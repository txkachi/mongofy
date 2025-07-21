import fs from "fs";
import path from "path";
import { Mongofy } from "../../mongofy";

const MIGRATIONS_COLLECTION = "_mongofy_migrations";

export async function runMigrate(args: string[], mongofy: Mongofy) {
  await mongofy.connect();

  const migrationsDir = path.resolve(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.log("[Mongofy] No migrations directory found.");
    return;
  }
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js") || f.endsWith(".ts"))
    .sort();
  const applied = new Set(
    (await mongofy.getCollection(MIGRATIONS_COLLECTION).find().toArray()).map(
      (m) => m.name,
    ),
  );

  if (args[0] === "down") {
    // Rollback last migration
    const last = Array.from(applied).pop();
    if (!last) {
      console.log("[Mongofy] No applied migrations to rollback.");
      return;
    }
    const migration = require(path.join(migrationsDir, last));
    if (typeof migration.down === "function") {
      console.log(`[Mongofy] Rolling back migration: ${last}`);
      await migration.down(mongofy);
      await mongofy
        .getCollection(MIGRATIONS_COLLECTION)
        .deleteOne({ name: last });
    }
    await mongofy.disconnect();
    console.log("[Mongofy] Rollback complete.");
    return;
  }

  for (const file of files) {
    if (applied.has(file)) continue;
    const migration = require(path.join(migrationsDir, file));
    if (typeof migration.up === "function") {
      console.log(`[Mongofy] Running migration: ${file}`);
      await migration.up(mongofy);
      await mongofy
        .getCollection(MIGRATIONS_COLLECTION)
        .insertOne({ name: file, appliedAt: new Date() });
    }
  }
  await mongofy.disconnect();
  console.log('[Mongofy] Migration complete.');
  process.exit(0);
}
