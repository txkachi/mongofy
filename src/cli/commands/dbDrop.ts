import { Mongofy } from "../../mongofy";

export async function runDbDrop(args: string[], mongofy: Mongofy) {
  await mongofy.connect();
  await mongofy.getCollection("system.namespaces").drop();
  console.log("[Mongofy] Database dropped.");
  await mongofy.disconnect();
  process.exit(0);
}
