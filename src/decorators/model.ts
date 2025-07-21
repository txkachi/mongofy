import { Schema } from "../schema";

export function ModelConfig(config: { collection: string; schema: any }) {
  return function (constructor: any) {
    constructor.collectionName = config.collection;
    constructor.schema = new Schema(config.schema);
  };
}
