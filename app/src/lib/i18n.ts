/** Deployment default, shared by document metadata and local formatters. */
export const DEFAULT_LOCALE = import.meta.env?.VITE_DEFAULT_LOCALE ?? "pt-BR";

/** Preserve expression evaluation order when a translated template reorders slots. */
export function formatMessage(
  message: string,
  values: readonly unknown[],
): string {
  return message.replace(/\{\{(\d+)\}\}/g, (_match, index: string) =>
    String(values[Number(index)]),
  );
}
