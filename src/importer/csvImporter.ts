import fs from "fs/promises";
import { Mongofy } from "../mongofy";
const csvParse = require("csv-parse/lib/sync");

export async function importFromCsv(options: {
  file: string;
  mongofy: Mongofy;
  collection: string;
}) {
  const csv = await fs.readFile(options.file, "utf-8");
  const data = csvParse(csv, { columns: true });
  await options.mongofy.insertMany(options.collection, data);
  console.log(
    `[Mongofy] Imported ${data.length} records from CSV to '${options.collection}'.`,
  );
}
