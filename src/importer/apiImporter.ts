import fetch from "node-fetch";
import { Mongofy } from "../mongofy";

export async function importFromApi(options: {
  url: string;
  mongofy: Mongofy;
  collection: string;
}) {
  const res = await fetch(options.url);
  const data = await res.json();
  if (!Array.isArray(data))
    throw new Error("API must return an array of objects.");
  await options.mongofy.insertMany(options.collection, data);
  console.log(
    `[Mongofy] Imported ${data.length} records from API to '${options.collection}'.`,
  );
}
