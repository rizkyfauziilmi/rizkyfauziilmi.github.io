export function isTypingTarget(target: EventTarget | null) {
  // Keydown can originate from window itself, which is not an Element.
  if (!(target instanceof Element)) return false;
  return Boolean(
    (target as HTMLElement).isContentEditable ||
    target.closest("input, textarea, select, [contenteditable='true']"),
  );
}
