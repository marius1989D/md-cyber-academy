/**
 * Minimal inline formatter for quiz strings.
 *
 * Question text and options need `code` and **bold** and nothing else — running
 * a full Markdown parser over them would be heavier than the whole quiz widget.
 * Escapes first, then re-introduces only the two tags we allow.
 */
export function inline(src: string): string {
  return src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
