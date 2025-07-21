import { Model } from "../model";
import { registerHook, HookType } from "../hooks";
import { WithId } from "mongodb";

export function applySoftDelete<T extends typeof Model>(ModelClass: T) {
  // Override delete to set deletedAt instead of removing
  const originalDelete = ModelClass.prototype.delete;
  ModelClass.prototype.delete = async function () {
    (this.data as any)["deletedAt"] = new Date();
    await this.update({ deletedAt: (this.data as any)["deletedAt"] });
  };

  // Filter out soft-deleted documents in find/findOne
  const originalFind = ModelClass.find;
  ModelClass.find = function <T extends object = any>(
    this: typeof Model,
    filter: object = {},
  ): Promise<Model<WithId<T>>[]> {
    (filter as any).deletedAt = { $exists: false };
    // @ts-expect-error
    return originalFind.call(this, filter);
  };
  const originalFindOne = ModelClass.findOne;
  ModelClass.findOne = function <T extends object = any>(
    this: typeof Model,
    filter: object = {},
  ): Promise<Model<WithId<T>> | null> {
    (filter as any).deletedAt = { $exists: false };
    // @ts-expect-error
    return originalFindOne.call(this, filter);
  };

  registerHook(HookType.BeforeDelete, async (instance) => {
    if (instance instanceof ModelClass && (instance.data as any)["deletedAt"]) {
      throw new Error("Document is already soft deleted.");
    }
  });
}
