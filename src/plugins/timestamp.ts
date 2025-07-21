import { registerHook, HookType } from "../hooks";

export function applyTimestamps() {
  registerHook(HookType.BeforeSave, (instance) => {
    if (!instance.data["createdAt"]) {
      instance.data["createdAt"] = new Date();
    }
    instance.data["updatedAt"] = new Date();
  });
  registerHook(HookType.BeforeUpdate, (instance, update) => {
    update["updatedAt"] = new Date();
  });
}
