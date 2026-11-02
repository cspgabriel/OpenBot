import type { PluginObj } from "@babel/core";
export interface LocalizationOptions {
  locale?: string;
  catalog?: Record<string, string>;
  extract?: Map<string, string>;
}
export function cleanText(value: string): string;
export function isMessage(value: string): boolean;
export function isDisplayPosition(path: unknown): boolean;
export default function localization(
  api: unknown,
  options?: LocalizationOptions,
): PluginObj;
