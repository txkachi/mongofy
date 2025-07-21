import { registerHook, HookType } from "../hooks";

export function applyVersioning(ModelClass: any) {
  registerHook(HookType.BeforeUpdate, (instance, update) => {
    update.version = (instance.data.version || 0) + 1;
  });
}
