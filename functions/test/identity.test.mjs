// Run: firebase emulators:exec --only firestore "node --test test/identity.test.mjs" (Firestore emulator).
// The Alker ID switch on the ALKE side: old invite links resolve, the
// migration window, and Alker ID reservation once the Nuru ID is one.
import test from "node:test";
import assert from "node:assert/strict";
import { initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { migrationGuard, resolveMoved } from "../identity.js";
import { reserveAlkerId } from "../signup.js";

initializeApp({ projectId: "demo-alke-id" });
const db = getFirestore();

test("old person IDs resolve to their Alker ID; everything else is unchanged", async () => {
  await db.doc("alke_config/id_moves/moves/N0000000000A").set({ to: "ALK-1111-2222-3333" });
  await db.doc("alke_config/id_moves/moves/AB12345678").set({ to: "ALK-4444-5555-6666" });
  assert.equal(await resolveMoved(db, "N0000000000A"), "ALK-1111-2222-3333");
  assert.equal(await resolveMoved(db, "AB12345678"), "ALK-4444-5555-6666");
  assert.equal(await resolveMoved(db, "N0000000000Z"), "N0000000000Z", "no move recorded");
  assert.equal(await resolveMoved(db, "ALK-1111-2222-3333"), "ALK-1111-2222-3333");
  assert.equal(await resolveMoved(db, null), null);
});

test("triggers stand down only for writes inside the migration window", async () => {
  let clock = 0;
  const during = migrationGuard(db, { cacheMs: 0, now: () => (clock += 1) });
  assert.equal(await during(Date.now()), false, "no window yet");
  const from = Date.now();
  await db.doc("app_config/maintenance").set({ migratingFrom: Timestamp.fromMillis(from), migratingUntil: null });
  assert.equal(await during(from + 5), true);
  await db.doc("app_config/maintenance").set({ migratingUntil: Timestamp.fromMillis(from + 1000) }, { merge: true });
  assert.equal(await during(new Date(from + 999).toISOString()), true, "a late event from inside");
  assert.equal(await during(from + 1001), false, "after");
  assert.equal(await during(from - 1), false, "before");
});

test("once the Nuru ID is an Alker ID, it is the member's Alker ID", async () => {
  await db.doc("alke_members/ALK-7777-8888-9999").set({ username: "x" });
  assert.deepEqual(await reserveAlkerId(db, "ALK-7777-8888-9999"), { alkerId: "ALK-7777-8888-9999" });
  assert.equal((await db.doc("alke_members/ALK-7777-8888-9999").get()).get("alkerId"), "ALK-7777-8888-9999");
  assert.equal((await db.doc("alke_config/alker_ids/taken/ALK-7777-8888-9999").get()).exists, false, "Nuru already reserved it");
});
