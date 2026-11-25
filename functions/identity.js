/* Alker IDs (Nuru repo docs/ALKER_ID_MIGRATION.md): the Alker ID
 * (ALK-0000-0000-0000) becomes everyone's Nuru ID, in Nuru and here.
 *
 *   alke_config/id_moves/moves/{oldId}  { to }   old N…/AIN person ID → Alker ID
 *   app_config/maintenance  { on, migratingFrom, migratingUntil }
 *
 * duringMigration: the migration rewrites everyone's records; triggers skip
 * events whose write time falls inside its window (late events included).
 * resolveMoved: an ID from before the switch (an old invite link) → its
 * Alker ID; anything else unchanged.
 */
export const ALK_RE = /^ALK-\d{4}-\d{4}-\d{4}$/;
const OLD_RE = /^(N[0-9A-Z]{11}|[A-Z]{2}\d{8})$/;

const ms = (t) => (t && typeof t.toMillis === "function" ? t.toMillis() : null);

export function migrationGuard(db, { cacheMs = 15000, now = () => Date.now() } = {}) {
  let cached = { at: -Infinity, v: null };
  return async function duringMigration(eventTime) {
    if (now() - cached.at > cacheMs) {
      const s = await db.doc("app_config/maintenance").get().catch(() => null);
      const d = s && s.exists ? s.data() : {};
      const from = ms(d.migratingFrom);
      cached = { at: now(), v: from ? { from, until: ms(d.migratingUntil) } : null };
    }
    const w = cached.v;
    if (!w) return false;
    const t = typeof eventTime === "number" ? eventTime : Date.parse(eventTime) || now();
    return t >= w.from && (!w.until || t <= w.until);
  };
}

export async function resolveMoved(db, id) {
  if (typeof id !== "string" || !OLD_RE.test(id)) return id;
  const s = await db.doc(`alke_config/id_moves/moves/${id}`).get().catch(() => null);
  const to = s && s.exists ? s.get("to") : null;
  return typeof to === "string" && ALK_RE.test(to) ? to : id;
}
