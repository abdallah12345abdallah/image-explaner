// Small helpers for presenting the logged-in user (avatar initials, greeting
// name). Kept framework-free so any view can reuse them.

/** First name for greetings — first token of the profile name, else the email
 *  local-part. Returns "" when nothing is known. */
export function firstName(name, email) {
  const n = (name || "").trim();
  if (n) return n.split(/\s+/)[0];
  const e = (email || "").trim();
  return e ? e.split("@")[0] : "";
}

/** Up to two initials for the avatar — from the name ("Abdallah Abo" → "AA"),
 *  else the first letter of the email, else "?". */
export function initials(name, email) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] || "";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  }
  const e = (email || "").trim();
  return e ? e[0].toUpperCase() : "?";
}
