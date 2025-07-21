# mongofy

> The ultimate MongoDB toolkit for Node.js & TypeScript/JavaScript

---

[![npm version](https://img.shields.io/npm/v/mongofy.svg)](https://www.npmjs.com/package/mongofy)
[![npm downloads](https://img.shields.io/npm/dm/mongofy.svg)](https://www.npmjs.com/package/mongofy)
[![license](https://img.shields.io/npm/l/mongofy.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/mongofy.svg)](https://www.npmjs.com/package/mongofy)

**GitHub:** [https://www.github.com/txkachi/mongofy](https://www.github.com/txkachi/mongofy)

## CLI Usage (Direct)

You can use the CLI directly with ts-node:

```sh
mongofy migrate --url mongodb://127.0.0.1/test
mongofy seed --url mongodb://127.0.0.1/test
mongofy import --from json --file data.json --collection users --url mongodb://127.0.0.1/test
mongofy db:status --url mongodb://127.0.0.1/test
mongofy db:drop --url mongodb://127.0.0.1/test
mongofy doc --url mongodb://127.0.0.1/test
```

All CLI commands require the `--url` argument to specify the MongoDB connection string.

---

## What is mongofy?

**mongofy** is a modern, feature-rich, and type-safe MongoDB client module for Node.js. It provides a clean, intuitive, and powerful API that covers all MongoDB features—and more. Whether you use TypeScript or JavaScript, mongofy makes working with MongoDB easier, safer, and more productive.

---

## Why use mongofy?

- **All-in-one:** Every MongoDB feature (CRUD, aggregation, transactions, indexes, etc.) in one place.
- **Type-safe:** First-class TypeScript support, but works perfectly in JavaScript too.
- **Modern API:** Clean, promise-based, and easy to use.
- **Better than native:** Adds logging, error handling, pagination, and more.
- **Production-ready:** Designed for real-world apps, scalable and robust.

---

## Features

- Connection management (auto-reconnect, health check)
- CRUD operations (single & bulk)
- Aggregation pipeline
- Transactions (multi-collection, ACID)
- Index management (create, drop, list)
- Pagination (limit, skip, cursor-based)
- Collection management (create, drop, list)
- Database switching
- Advanced error handling
- Built-in logging (customizable)
- TypeScript-first, but JS-friendly
- Extensible utility methods
- **CLI tool**: migration, seeding, universal import, model generation

---

## Installation

```bash
npm install mongofy
# or
yarn add mongofy
```

---

## Quick Start

### TypeScript Example

```ts
import { Mongofy } from "mongofy";

const db = new Mongofy({ databaseURL: "mongodb://127.0.0.1/test" });

async function main() {
  await db.connect();
  const user = await db.insertOne("users", { name: "Alice", age: 30 });
  const users = await db.find("users", { age: { $gte: 18 } });
  await db.disconnect();
}

main();
```

### JavaScript Example

```js
const { Mongofy } = require("mongofy");

const db = new Mongofy({ databaseURL: "mongodb://127.0.0.1/test" });

async function main() {
  await db.connect();
  const user = await db.insertOne("users", { name: "Alice", age: 30 });
  const users = await db.find("users", { age: { $gte: 18 } });
  await db.disconnect();
}

main();
```

---

## CLI Usage

### Mongofy Instance for CLI

All CLI commands require a Mongofy instance:

```js
const { Mongofy } = require("mongofy");
const db = new Mongofy({ databaseURL: "mongodb://127.0.0.1/test" });
```

### Migrate

Run all migration scripts in the `migrations/` directory:

```js
const { runMigrate } = require("mongofy/cli");
await runMigrate([], db); // migrate up
await runMigrate(["down"], db); // migrate down
```

Each migration file should export an `up` and optionally a `down` function:

```js
// migrations/001-create-users.js
module.exports.up = async (db) => {
  await db.createCollection("users");
};
module.exports.down = async (db) => {
  await db.dropCollection("users");
};
```

### Seed

Run a seed script (`seed.js` or `seed.ts` in project root):

```js
const { runSeed } = require("mongofy/cli");
await runSeed([], db);
```

Example:

```js
// seed.js
module.exports = async (db) => {
  await db.insertOne("users", { name: "Seed User", age: 99 });
};
```

### Universal Import

Import data from JSON, CSV, SQL, or API:

```js
const { runImport } = require("mongofy/cli");
await runImport(
  ["--from", "json", "--file", "data.json", "--collection", "users"],
  db
);
await runImport(
  ["--from", "csv", "--file", "data.csv", "--collection", "users"],
  db
);
await runImport(
  [
    "--from",
    "api",
    "--url",
    "https://api.example.com/users",
    "--collection",
    "users",
  ],
  db
);
```

### Generate Model

Scaffold a new model file:

```js
const { runGenerateModel } = require("mongofy/cli");
await runGenerateModel(["User"]);
```

This creates `src/User.model.ts` with a basic schema and class.

### Database Status & Drop

```js
const { runDbStatus, runDbDrop } = require("mongofy/cli");
await runDbStatus([], db);
await runDbDrop([], db);
```

### API Documentation Generation

```js
const { runDoc } = require("mongofy/cli");
await runDoc([]); // Generates openapi.schemas.json
```

---

## Migration/Seed/Import File Examples

**Migration:**

```js
module.exports.up = async (db) => {
  await db.createCollection("users");
};
module.exports.down = async (db) => {
  await db.dropCollection("users");
};
```

**Seed:**

```js
module.exports = async (db) => {
  await db.insertOne("users", { name: "Seed User", age: 99 });
};
```

**Import:**

```js
await runImport(
  ["--from", "json", "--file", "data.json", "--collection", "users"],
  db
);
```

---

## API Documentation

### Connection Management

- `connect(): Promise<void>` — Connects to the database.
- `disconnect(): Promise<void>` — Closes the connection.
- `isConnected(): boolean` — Returns connection status.
- `switchDatabase(dbName: string): void` — Switches to another database.
- `healthCheck(): Promise<boolean>` — Checks if the connection is healthy.

### CRUD Operations

- `insertOne<T>(collection: string, doc: T): Promise<InsertOneResult<T>>`
- `insertMany<T>(collection: string, docs: T[]): Promise<InsertManyResult<T>>`
- `find<T>(collection: string, filter?: Filter<T>, options?: FindOptions): Promise<T[]>`
- `findOne<T>(collection: string, filter: Filter<T>, options?: FindOptions): Promise<T | null>`
- `updateOne<T>(collection: string, filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<UpdateResult>`
- `updateMany<T>(collection: string, filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<UpdateResult>`
- `deleteOne<T>(collection: string, filter: Filter<T>): Promise<DeleteResult>`
- `deleteMany<T>(collection: string, filter: Filter<T>): Promise<DeleteResult>`
- `countDocuments<T>(collection: string, filter?: Filter<T>): Promise<number>`

### Aggregation

- `aggregate<T>(collection: string, pipeline: Document[], options?: AggregateOptions): Promise<T[]>`

### Transactions

- `withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T>`

### Index Management

- `createIndex(collection: string, indexSpec: IndexSpecification, options?: CreateIndexesOptions): Promise<string>`
- `dropIndex(collection: string, indexName: string): Promise<void>`
- `listIndexes(collection: string): Promise<IndexDescription[]>`

### Pagination

- All `find` methods support `limit`, `skip`, and `sort` options.
- Cursor-based pagination via `findWithCursor` (see advanced examples).

### Collection Management

- `createCollection(name: string, options?: CreateCollectionOptions): Promise<Collection>`
- `dropCollection(name: string): Promise<void>`
- `listCollections(): Promise<string[]>`

### Error Handling & Logging

- All methods throw rich, custom errors.
- Built-in logging (can be customized or disabled).

---

## Advanced Usage Examples

### Bulk Operations (TypeScript)

```ts
await db.insertMany("users", [
  { name: "Bob", age: 22 },
  { name: "Carol", age: 27 },
]);

await db.updateMany(
  "users",
  { age: { $lt: 25 } },
  { $set: { status: "young" } }
);
```

### Aggregation Pipeline (JavaScript)

```js
const pipeline = [
  { $match: { age: { $gte: 18 } } },
  { $group: { _id: "$status", count: { $sum: 1 } } },
];
const stats = await db.aggregate("users", pipeline);
```

### Transactions (TypeScript)

```ts
await db.withTransaction(async (session) => {
  await db.insertOne("accounts", { name: "A", balance: 100 }, { session });
  await db.insertOne("accounts", { name: "B", balance: 200 }, { session });
});
```

### Index Management (JavaScript)

```js
await db.createIndex("users", { email: 1 }, { unique: true });
const indexes = await db.listIndexes("users");
await db.dropIndex("users", "email_1");
```

### Pagination (TypeScript)

```ts
const users = await db.find(
  "users",
  {},
  { limit: 10, skip: 20, sort: { age: -1 } }
);
```

### Collection Management (JavaScript)

```js
await db.createCollection("logs");
const collections = await db.listCollections();
await db.dropCollection("logs");
```

### Error Handling & Logging (TypeScript)

```ts
try {
  await db.insertOne("users", { name: "Eve" });
} catch (error) {
  console.error("Insert failed:", error);
}
```

---

## FAQ & Tips

**Q: Can I use mongofy in both TypeScript and JavaScript projects?**  
A: Yes! mongofy is written in TypeScript and ships with type definitions, but works perfectly in JavaScript.

**Q: Does mongofy support all MongoDB features?**  
A: Yes! If MongoDB supports it, mongofy does too—and often with a better API.

**Q: Is logging customizable?**  
A: Yes! You can provide your own logger or disable logging entirely.

**Q: How do I handle transactions?**  
A: Use the `withTransaction` method and pass your logic as a callback.

**Q: Is mongofy production-ready?**  
A: Absolutely. It’s designed for real-world, scalable applications.

---

## License

MIT
