// Builds combined.rules = Nuru's Firestore ruleset + ../firestore.alke.rules,
// the way the live ruleset is put together. Base rules: NURU_RULES env, else
// the Nuru repo next door. Since the ALKÉ section went live through the Nuru
// repo, its firestore.rules may already hold an (older) copy of it: that copy
// is replaced by ours, so the tests always check the local rules.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.NURU_RULES || path.resolve(here, "../../../../Nuru/nuru_ai/firestore.rules");
const rules = fs.readFileSync(base, "utf8");
const alke = fs.readFileSync(path.resolve(here, "../firestore.alke.rules"), "utf8");
const HEADER = "// ── ALKÉ Network app (app.alke.network)";

const marker = rules.lastIndexOf("match /{collection}/{document=**}");
if (marker < 0) throw new Error("fallback match not found in " + base);
// The fallback's whole comment block starts here (the comment lines directly above it).
let lineStart = rules.lastIndexOf("\n", marker);
for (;;) {
  const prev = rules.lastIndexOf("\n", lineStart - 1);
  if (prev < 0 || !rules.slice(prev + 1, lineStart).trim().startsWith("//")) break;
  lineStart = prev;
}

let out;
const had = rules.indexOf(HEADER);
if (had >= 0 && had < lineStart) {
  // Already in Nuru's rules (and in its exclusion list): swap in ours.
  const from = rules.lastIndexOf("\n", had);
  out = rules.slice(0, from) + "\n" + alke + "\n" + rules.slice(lineStart);
  if (!/'alke_config'/.test(out.slice(out.lastIndexOf("match /{collection}/{document=**}")))) {
    throw new Error("Nuru's fallback exclusion list doesn't name alke_config");
  }
} else {
  out = rules.slice(0, lineStart) + "\n" + alke + "\n" + rules.slice(lineStart);
  // The second console edit: keep member records, the server's per-day
  // session logs, identity records, the team list and config out of the
  // public-read fallback (rules are OR-ed: otherwise `read: if true` wins).
  const before = out;
  out = out.replace(
    /'nuru_people',(\s*)'nuru_logins'/,
    "'nuru_people', 'alke_members', 'alke_days', 'alke_settlements', 'alke_scores',$1'alke_verifications', 'alke_admins', 'alke_config',$1'nuru_logins'",
  );
  if (out === before) throw new Error("couldn't add the alke collections to the fallback exclusion list");
}
fs.writeFileSync(path.join(here, "combined.rules"), out);
console.log(`combined.rules from ${base}${had >= 0 ? " (its ALKÉ section replaced by ours)" : ""}`);
