import { importFromJson } from "./jsonImporter";
import { importFromCsv } from "./csvImporter";
import { importFromSql } from "./sqlImporter";
import { importFromApi } from "./apiImporter";

export async function universalImport(options: {
  from: "json" | "csv" | "sql" | "api";
  [key: string]: any;
}) {
  switch (options.from) {
    case "json": {
      const { from, file, mongofy, collection, ...rest } = options;
      if (!file || !mongofy || !collection) {
        throw new Error(
          "Missing required parameters for JSON import: file, mongofy, collection",
        );
      }
      return importFromJson({ file, mongofy, collection, ...rest });
    }
    case "csv": {
      const { from, file, mongofy, collection, ...rest } = options;
      if (!file || !mongofy || !collection) {
        throw new Error(
          "Missing required parameters for CSV import: file, mongofy, collection",
        );
      }
      return importFromCsv({ file, mongofy, collection, ...rest });
    }
    case "sql": {
      const { from, dbType, connection, table, mongofy, collection, ...rest } =
        options;
      if (!dbType || !connection || !table || !mongofy || !collection) {
        throw new Error(
          "Missing required parameters for SQL import: dbType, connection, table, mongofy, collection",
        );
      }
      return importFromSql({
        dbType,
        connection,
        table,
        mongofy,
        collection,
        ...rest,
      });
    }
    case "api": {
      const { from, url, mongofy, collection, ...rest } = options;
      if (!url || !mongofy || !collection) {
        throw new Error(
          "Missing required parameters for API import: url, mongofy, collection",
        );
      }
      return importFromApi({ url, mongofy, collection, ...rest });
    }
    default:
      throw new Error("Unknown import source: " + options.from);
  }
}
