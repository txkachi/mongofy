import { Mongofy } from "./mongofy";
import { Schema, validateSchema } from "./schema";
import { runHooks, HookType } from "./hooks";
import { OptionalUnlessRequiredId, WithId } from "mongodb";

export class Model<T extends object = any> {
  static collectionName: string;
  static schema: Schema;
  static mongofy: Mongofy;

  constructor(public data: T) {}

  async save(): Promise<WithId<T>> {
    await runHooks(HookType.BeforeSave, this);
    validateSchema((this.constructor as typeof Model).schema, this.data);
    const result = await (
      this.constructor as typeof Model
    ).mongofy.insertOne<T>(
      (this.constructor as typeof Model).collectionName,
      this.data as OptionalUnlessRequiredId<T>,
    );
    await runHooks(HookType.AfterSave, this);
    return { ...this.data, _id: result.insertedId } as WithId<T>;
  }

  async update(update: Partial<T>): Promise<void> {
    await runHooks(HookType.BeforeUpdate, this, update);
    validateSchema((this.constructor as typeof Model).schema, {
      ...this.data,
      ...update,
    });
    await (this.constructor as typeof Model).mongofy.updateOne<T>(
      (this.constructor as typeof Model).collectionName,
      { _id: (this.data as any)._id },
      { $set: update },
    );
    Object.assign(this.data, update);
    await runHooks(HookType.AfterUpdate, this, update);
  }

  async delete(): Promise<void> {
    await runHooks(HookType.BeforeDelete, this);
    await (this.constructor as typeof Model).mongofy.deleteOne<T>(
      (this.constructor as typeof Model).collectionName,
      { _id: (this.data as any)._id },
    );
    await runHooks(HookType.AfterDelete, this);
  }

  static async find<T extends object = any>(
    this: typeof Model,
    filter: object = {},
  ): Promise<Model<WithId<T>>[]> {
    const docs = await this.mongofy.find<T>(this.collectionName, filter);
    return docs.map((doc) => new this(doc));
  }

  static async findOne<T extends object = any>(
    this: typeof Model,
    filter: object = {},
  ): Promise<Model<WithId<T>> | null> {
    const doc = await this.mongofy.findOne<T>(this.collectionName, filter);
    return doc ? new this(doc) : null;
  }

  static async create<T extends object = any>(
    this: typeof Model,
    data: T,
  ): Promise<Model<WithId<T>>> {
    const instance = new this(data) as Model<T>;
    const saved = await instance.save();
    return new this(saved) as Model<WithId<T>>;
  }

  /**
   * Populate referenced fields using $lookup-like logic.
   * @param field - The field to populate (should be an ObjectId or array of ObjectIds)
   * @param from - The collection to join
   * @param localField - The local field name
   * @param foreignField - The foreign field name in the joined collection
   */
  static async populate<T extends object = any>(
    this: typeof Model,
    docs: any[],
    field: string,
    from: string,
    localField: string,
    foreignField: string,
  ): Promise<any[]> {
    if (!docs.length) return docs;
    const mongofy = this.mongofy;
    const ids = docs.map((doc) => doc[localField]).filter(Boolean);
    const related = await mongofy.find(from, { [foreignField]: { $in: ids } });
    const relatedMap = new Map(
      related.map((r: any) => [r[foreignField].toString(), r]),
    );
    return docs.map((doc) => ({
      ...doc,
      [field]: relatedMap.get(doc[localField]?.toString()) || null,
    }));
  }
}
