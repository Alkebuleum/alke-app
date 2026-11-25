// One-off: move Ambassador data out of collections the rules leave publicly
// readable (alke_ambassadors, alke_ambassador_log) into alke_config/ambassadors
// (server-only). Copies everything first, deletes the public copies after.
//
// Usage (from functions/):
//   node scripts/move-ambassadors-private.mjs            # dry run: lists what moves
//   node scripts/move-ambassadors-private.mjs --write    # moves it
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault(), projectId: process.env.GCLOUD_PROJECT || "amid-7592b" });
const db = getFirestore();
const write = process.argv.includes("--write");

const moves = [
  ["alke_ambassadors", "alke_config/ambassadors/members"],
  ["alke_ambassador_log", "alke_config/ambassadors/log"],
];

let total = 0;
const old = [];
for (const [from, to] of moves) {
  const snap = await db.collection(from).get();
  console.log(`${from} → ${to}: ${snap.size} document(s)`);
  total += snap.size;
  if (!write) continue;
  for (const d of snap.docs) {
    await db.collection(to).doc(d.id).set(d.data());
    old.push(d.ref);
  }
}
if (write) {
  // Every copy is written; now the public ones go.
  for (const r of old) await r.delete();
  console.log(`Moved ${old.length} document(s); public copies deleted.`);
} else {
  console.log(`Dry run: ${total} document(s) would move. Add --write to move them.`);
}
