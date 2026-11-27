// Escapes text for one cell of a Markdown table in the generated docs. Backslashes go first, so the backslash
// added before `|` can't be undone by one already in the text.
export const esc = (s) =>
  String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, " ");
