import {
  MongoClient,
  Db,
  MongoClientOptions,
  Document,
  Collection,
  OptionalUnlessRequiredId,
  WithId,
} from "mongodb";
import { Logger, defaultLogger } from "./utils/logger";
import { Model } from "./model";

export interface MongofyOptions {
  databaseURL: string;
  dbName?: string;
  options?: MongoClientOptions;
  logger?: Logger;
}

/**
 * Main Mongofy class. Handles MongoDB connection, plugin registration, and exposes all features.
 */
export class Mongofy {
  private client: MongoClient;
  private db: Db | null = null;
  private logger: Logger;
  private plugins: Function[] = [];
  private uri: string;
  private dbName: string;

  /**
   * Create a new Mongofy instance.
   * @param config MongofyOptions: { databaseURL, dbName, options, logger }
   */
  constructor(config: MongofyOptions) {
    this.uri = config.databaseURL;
    this.dbName =
      config.dbName || this._extractDbNameFromUri(config.databaseURL);
    this.client = new MongoClient(this.uri, config.options);
    this.logger = config.logger || defaultLogger;
  }

  private _extractDbNameFromUri(uri: string): string {
    const match = uri.match(/\/([\w-]+)(\?|$)/);
    if (match && match[1]) return match[1];
    throw new Error(
      "Database name could not be determined from URI. Please specify dbName explicitly.",
    );
  }

  /**
   * Connect to the MongoDB server.
   */
  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.logger.info(`Connected to database: ${this.dbName}`);
  }

  /**
   * Disconnect from the MongoDB server.
   */
  async disconnect(): Promise<void> {
    await this.client.close();
    this.db = null;
    this.logger.info("Disconnected from MongoDB");
  }

  /**
   * Register a plugin (e.g., soft delete, audit log, etc.).
   */
  registerPlugin(plugin: Function) {
    this.plugins.push(plugin);
    this.logger.info("Plugin registered:", plugin.name);
  }

  /**
   * Get a collection by name.
   */
  getCollection<T extends Document = Document>(name: string): Collection<T> {
    if (!this.db) throw new Error("Database is not connected");
    return this.db.collection<T>(name);
  }

  /**
   * Insert a single document into a collection.
   */
  async insertOne<T extends Document>(
    collection: string,
    doc: OptionalUnlessRequiredId<T>,
    options?: any,
  ) {
    return this.getCollection<T>(collection).insertOne(doc, options);
  }

  /**
   * Insert multiple documents into a collection.
   */
  async insertMany<T extends Document>(
    collection: string,
    docs: OptionalUnlessRequiredId<T>[],
    options?: any,
  ) {
    return this.getCollection<T>(collection).insertMany(docs, options);
  }

  /**
   * Update a single document in a collection.
   */
  async updateOne<T extends Document>(
    collection: string,
    filter: any,
    update: any,
    options?: any,
  ) {
    return this.getCollection<T>(collection).updateOne(filter, update, options);
  }

  /**
   * Delete a single document from a collection.
   */
  async deleteOne<T extends Document>(
    collection: string,
    filter: any,
    options?: any,
  ) {
    return this.getCollection<T>(collection).deleteOne(filter, options);
  }

  /**
   * Find documents in a collection.
   */
  async find<T extends Document>(
    collection: string,
    filter: any = {},
    options?: any,
  ): Promise<WithId<T>[]> {
    return this.getCollection<T>(collection).find(filter, options).toArray();
  }

  /**
   * Find a single document in a collection.
   */
  async findOne<T extends Document>(
    collection: string,
    filter: any = {},
    options?: any,
  ): Promise<WithId<T> | null> {
    return this.getCollection<T>(collection).findOne(filter, options);
  }

  /**
   * Run an aggregation pipeline on a collection.
   */
  async aggregate<T extends Document>(
    collection: string,
    pipeline: Document[],
    options?: any,
  ): Promise<WithId<T>[]> {
    return this.getCollection<T>(collection)
      .aggregate<WithId<T>>(pipeline, options)
      .toArray();
  }

  /**
   * Execute operations in a transaction.
   */
  async withTransaction<T>(
    fn: (session: import("mongodb").ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = this.client.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      this.logger.info("Transaction committed");
      // @ts-expect-error result is always set
      return result;
    } catch (error) {
      this.logger.error("Transaction failed:", error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Create an index on a collection.
   */
  async createIndex<T extends Document>(
    collection: string,
    indexSpec: Document,
    options?: any,
  ): Promise<string> {
    return this.getCollection<T>(collection).createIndex(indexSpec, options);
  }

  /**
   * Drop an index from a collection.
   */
  async dropIndex<T extends Document>(
    collection: string,
    indexName: string,
    options?: any,
  ): Promise<void> {
    await this.getCollection<T>(collection).dropIndex(indexName, options);
  }

  /**
   * List all indexes on a collection.
   */
  async listIndexes(collection: string, options?: any): Promise<Document[]> {
    return this.getCollection(collection).listIndexes(options).toArray();
  }

  /**
   * Find documents with pagination (limit, skip, sort).
   */
  async findWithPagination<T extends Document>(
    collection: string,
    filter: any = {},
    options: { limit?: number; skip?: number; sort?: Document } = {},
  ): Promise<{ data: WithId<T>[]; total: number }> {
    const { limit = 10, skip = 0, sort = {} } = options;
    const data = await this.getCollection<T>(collection)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    const total =
      await this.getCollection<T>(collection).countDocuments(filter);
    return { data, total };
  }

  /**
   * Create a new collection.
   */
  async createCollection(name: string, options?: any): Promise<Collection> {
    if (!this.db) throw new Error("Database is not connected");
    return this.db.createCollection(name, options);
  }

  /**
   * Drop a collection.
   */
  async dropCollection(name: string): Promise<void> {
    if (!this.db) throw new Error("Database is not connected");
    await this.db.dropCollection(name);
  }

  /**
   * List all collections in the database.
   */
  async listCollections(): Promise<string[]> {
    if (!this.db) throw new Error("Database is not connected");
    const collections = await this.db.listCollections().toArray();
    return collections.map((c) => c.name);
  }

  /**
   * Count documents in a collection.
   */
  async countDocuments<T extends Document>(
    collection: string,
    filter: any = {},
    options?: any,
  ): Promise<number> {
    return this.getCollection<T>(collection).countDocuments(filter, options);
  }

  /**
   * Error handling example: wrap any method to log and rethrow errors.
   */
  private handleError(method: string, error: any) {
    this.logger.error(`[Mongofy] ${method} failed:`, error);
    throw error;
  }
}
