import fs from "fs/promises";
import { Mongofy } from "../mongofy";

export async function importFromJson(options: {
  file: string;
  mongofy: Mongofy;
  collection: string;
}) {
  const data = JSON.parse(await fs.readFile(options.file, "utf-8"));
  if (!Array.isArray(data))
    throw new Error("JSON file must contain an array of objects.");
  await options.mongofy.insertMany(options.collection, data);
  console.log(
    `[Mongofy] Imported ${data.length} records from JSON to '${options.collection}'.`,
  );
}
