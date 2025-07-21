#!/usr/bin/env ts-node
import { Mongofy } from "../mongofy";
import { runMigrate } from "./commands/migrate";
import { runSeed } from "./commands/seed";
import { runImport } from "./commands/import";
import { runGenerateModel } from "./commands/generateModel";
import { runDbStatus } from "./commands/dbStatus";
import { runDbDrop } from "./commands/dbDrop";
import { runDoc } from "./commands/doc";

// Parse CLI args
const [, , command, ...args] = process.argv;

// Find --url or --databaseURL argument
let databaseURL = "";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--url" || args[i] === "--databaseURL") {
    databaseURL = args[i + 1];
    args.splice(i, 2);
    break;
  }
}
if (!databaseURL) {
  console.error(
    "[Mongofy CLI] Please provide a MongoDB URL with --url <mongodb_url>",
  );
  process.exit(1);
}
const db = new Mongofy({ databaseURL });

(async () => {
  switch (command) {
    case "migrate":
      await runMigrate(args, db);
      break;
    case "seed":
      await runSeed(args, db);
      break;
    case "import":
      await runImport(args, db);
      break;
    case "generate:model":
      await runGenerateModel(args);
      break;
    case "db:status":
      await runDbStatus(args, db);
      break;
    case "db:drop":
      await runDbDrop(args, db);
      break;
    case "doc":
      await runDoc(args);
      break;
    default:
      console.log(
        "Usage: mongofy <migrate|seed|import|generate:model|db:status|db:drop|doc> [options] --url <mongodb_url>",
      );
  }
})();
