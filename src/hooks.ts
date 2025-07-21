export enum HookType {
  BeforeSave = "beforeSave",
  AfterSave = "afterSave",
  BeforeUpdate = "beforeUpdate",
  AfterUpdate = "afterUpdate",
  BeforeDelete = "beforeDelete",
  AfterDelete = "afterDelete",
}

export type HookFn = (...args: any[]) => Promise<void> | void;

const hooks: Partial<Record<HookType, HookFn[]>> = {};

export function registerHook(type: HookType, fn: HookFn) {
  if (!hooks[type]) hooks[type] = [];
  hooks[type]!.push(fn);
}

export async function runHooks(type: HookType, ...args: any[]) {
  if (!hooks[type]) return;
  for (const fn of hooks[type]!) {
    await fn(...args);
  }
}
