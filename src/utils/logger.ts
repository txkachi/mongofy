export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export const defaultLogger: Logger = {
  info: (...args) => console.info("[Mongofy]", ...args),
  warn: (...args) => console.warn("[Mongofy]", ...args),
  error: (...args) => console.error("[Mongofy]", ...args),
};
