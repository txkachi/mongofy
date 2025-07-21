import fs from "fs";
import path from "path";

export async function runGenerateModel(args: string[]) {
  const name = args[0];
  if (!name) {
    console.log("[Mongofy] Usage: mongofy generate:model <ModelName>");
    return;
  }
  const className = name.charAt(0).toUpperCase() + name.slice(1);
  const filePath = path.resolve(process.cwd(), "src", `${name}.model.ts`);
  if (fs.existsSync(filePath)) {
    console.log(`[Mongofy] Model file already exists: ${filePath}`);
    return;
  }
  const content = `import { Model } from './model';\nimport { Schema } from './schema';\n\nexport class ${className} extends Model<any> {\n  static collectionName = '${name}s';\n  static schema = new Schema({\n    // Define your schema fields here\n    name: 'string',\n    createdAt: 'date',\n  });\n}\n`;
  fs.writeFileSync(filePath, content);
  console.log(`[Mongofy] Model created: ${filePath}`);
}
