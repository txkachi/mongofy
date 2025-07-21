import fs from "fs";
import path from "path";
import { Schema } from "../../schema";

export async function runDoc(args: string[]) {
  const modelsDir = path.resolve(process.cwd(), "src");
  const files = fs
    .readdirSync(modelsDir)
    .filter((f) => f.endsWith(".model.ts"));
  const schemas: any = {};
  for (const file of files) {
    const model = require(path.join(modelsDir, file));
    if (model && model.default && model.default.schema instanceof Schema) {
      schemas[model.default.name] = model.default.schema.definition;
    }
  }
  fs.writeFileSync("openapi.schemas.json", JSON.stringify(schemas, null, 2));
  console.log("[Mongofy] OpenAPI schemas generated: openapi.schemas.json");
  process.exit(0);
}
