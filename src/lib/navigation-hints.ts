/** nav.yieldOverview → nav.hint.yieldOverview */
export function navHintKey(labelKey: string): string {
  if (!labelKey.startsWith("nav.")) return labelKey;
  return `nav.hint.${labelKey.slice(4)}`;
}
