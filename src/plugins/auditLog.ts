import { registerHook, HookType } from "../hooks";

export function applyAuditLog(
  modelName: string,
  logger: { info: (...args: any[]) => void },
) {
  registerHook(HookType.AfterSave, (instance) => {
    logger.info(`[AuditLog] Created:`, modelName, instance.data);
  });
  registerHook(HookType.AfterUpdate, (instance, update) => {
    logger.info(`[AuditLog] Updated:`, modelName, instance.data, update);
  });
  registerHook(HookType.AfterDelete, (instance) => {
    logger.info(`[AuditLog] Deleted:`, modelName, instance.data);
  });
}
