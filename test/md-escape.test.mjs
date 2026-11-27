// Unit tests for the Markdown table-cell escaping the docs build uses (CodeQL js/incomplete-sanitization).
import { test } from "node:test";
import assert from "node:assert/strict";
import { esc } from "../scripts/md-escape.mjs";

test("esc escapes backslashes before pipes, so a cell can't break out of its column", () => {
  assert.equal(esc("a|b"), "a\\|b");
  assert.equal(esc("a\\|b"), "a\\\\\\|b");
  assert.equal(esc("C:\\path"), "C:\\\\path");
});

test("esc escapes angle brackets, joins lines and treats missing values as empty", () => {
  assert.equal(esc("<b>\nx"), "&lt;b&gt; x");
  assert.equal(esc(undefined), "");
  assert.equal(esc(null), "");
});
