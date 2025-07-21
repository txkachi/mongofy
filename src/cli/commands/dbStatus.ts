import { Mongofy } from "../../mongofy";

export async function runDbStatus(args: string[], mongofy: Mongofy) {
  await mongofy.connect();
  const collections = await mongofy.listCollections();
  console.log("[Mongofy] Collections:", collections);
  await mongofy.disconnect();
}
