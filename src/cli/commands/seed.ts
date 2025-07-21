import path from "path";
import { Mongofy } from "../../mongofy";

export async function runSeed(args: string[], mongofy: Mongofy) {
  await mongofy.connect();

  const seedFile = path.resolve(process.cwd(), "seed.js");
  const seedFileTs = path.resolve(process.cwd(), "seed.ts");
  let seed;
  if (require("fs").existsSync(seedFile)) {
    seed = require(seedFile);
  } else if (require("fs").existsSync(seedFileTs)) {
    seed = require(seedFileTs);
  } else {
    console.log("[Mongofy] No seed.js or seed.ts file found.");
    await mongofy.disconnect();
    return;
  }
  if (typeof seed === "function") {
    await seed(mongofy);
  } else if (typeof seed.default === "function") {
    await seed.default(mongofy);
  }
  await mongofy.disconnect();
  console.log("[Mongofy] Seed complete.");
}
