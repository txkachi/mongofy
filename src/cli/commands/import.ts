import { universalImport } from "../../importer/importer";
import { Mongofy } from "../../mongofy";

export async function runImport(args: string[], mongofy: Mongofy) {
  // Example usage: mongofy import --from json --file data.json --collection users
  const options: any = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    options[key] = args[i + 1];
  }
  if (!options.from) {
    console.log("[Mongofy] --from <json|csv|sql|api> is required.");
    return;
  }
  if (!options.collection) {
    console.log("[Mongofy] --collection <name> is required.");
    return;
  }
  options.mongofy = mongofy;
  await mongofy.connect();
  await universalImport(options);
  await mongofy.disconnect();
  console.log('[Mongofy] Import complete.');
  process.exit(0);
}
