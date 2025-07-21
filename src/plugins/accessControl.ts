import { registerHook, HookType } from "../hooks";

export function applyAccessControl(
  ModelClass: any,
  checkFn: (user: any, doc: any) => boolean,
) {
  registerHook(HookType.BeforeUpdate, (instance, update, user) => {
    if (!checkFn(user, instance.data)) throw new Error("Access denied");
  });
}
