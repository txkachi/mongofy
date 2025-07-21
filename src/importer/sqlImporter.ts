import { Mongofy } from "../mongofy";

/**
 * Import data from a SQL table (MySQL or PostgreSQL) into a MongoDB collection.
 *
 * @param options - dbType: 'mysql' | 'postgres', connection: connection config, table: SQL table name, mongofy: Mongofy instance, collection: MongoDB collection name
 */
export async function importFromSql(options: {
  dbType: "mysql" | "postgres";
  connection: any;
  table: string;
  mongofy: Mongofy;
  collection: string;
}) {
  let rows: any[] = [];
  if (options.dbType === "mysql") {
    const mysql = require("mysql2/promise");
    const conn = await mysql.createConnection(options.connection);
    const [results] = await conn.execute(`SELECT * FROM \`${options.table}\``);
    rows = results as any[];
    await conn.end();
  } else if (options.dbType === "postgres") {
    const { Client } = require("pg");
    const client = new Client(options.connection);
    await client.connect();
    const res = await client.query(`SELECT * FROM "${options.table}"`);
    rows = res.rows;
    await client.end();
  } else {
    throw new Error("Unsupported dbType: " + options.dbType);
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log("[Mongofy] No data found in SQL table.");
    return;
  }

  await options.mongofy.insertMany(options.collection, rows);
  console.log(
    `[Mongofy] Imported ${rows.length} records from SQL table '${options.table}' to MongoDB collection '${options.collection}'.`,
  );
}
