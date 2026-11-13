// Builds combined.rules = Nuru's Firestore ruleset + ../firestore.alke.rules,
// inserted above the catch-all fallback, the way it goes into the console.
// Base rules: NURU_RULES env, else the Nuru repo next door.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.NURU_RULES || path.resolve(here, "../../../../Nuru/nuru_ai/firestore.rules");
const rules = fs.readFileSync(base, "utf8");
const alke = fs.readFileSync(path.resolve(here, "../firestore.alke.rules"), "utf8");

const marker = rules.lastIndexOf("match /{collection}/{document=**}");
if (marker < 0) throw new Error("fallback match not found in " + base);
const lineStart = rules.lastIndexOf("\n", rules.lastIndexOf("//", marker) > rules.lastIndexOf("}", marker) ? rules.lastIndexOf("//", marker) : marker);
let out = rules.slice(0, lineStart) + "\n" + alke + "\n" + rules.slice(lineStart);
// The second console edit: keep member records and the server's per-day
// session logs out of the public-read fallback.
const before = out;
out = out.replace(/'nuru_people',(\s*)'nuru_logins'/, "'nuru_people', 'alke_members', 'alke_days', 'alke_settlements',$1'nuru_logins'");
if (out === before) throw new Error("couldn't add the alke collections to the fallback exclusion list");
fs.writeFileSync(path.join(here, "combined.rules"), out);
console.log(`combined.rules from ${base}`);
