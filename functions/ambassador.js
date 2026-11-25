/* ALKÉ Ambassador Program (server).
 *
 *   alke_config/ambassador        program settings, edited by the team (merged over DEFAULTS)
 *   alke_config/ambassadorRefs    { next } reference counter
 *   alke_ambassadors/{nuruId}     { country, interest, status, ref, application, stats,
 *                                   timeline: [{ status, at, note }], info, decidedAt, ... }
 *
 * Members never read these collections directly: everything goes through
 * the alkeAmbassador / alkeAmbassadorAdmin callables, so no rules change is
 * needed. Eligibility is worked out here from real data, never trusted from
 * the app.
 *
 * Pay is described, never handled: ALKE has no wallets, payments or crypto.
 * Compensation is paid through the Nuru app.
 */
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { notify } from "./notify.js";
import { sendBrevo } from "./signup.js";

export const DEFAULTS = {
  // Countries: open = applications accepted; others can register interest.
  countries: { NG: { name: "Nigeria", open: true, positions: 1 } },
  eligibility: { activeDays: 14, directReferrals: 25, minAge: 18 },
  // A qualifying referral: this many drills within this many days of joining.
  qualifying: { drills: 7, withinDays: 30 },
  compensation: {
    currency: "USDC",
    direct: 0.4,
    indirect: 0.2,
    indirectEnabled: false, // second generation stays off until compliance approves it
    managementFee: 25,
    mgmtCombined: 100,
    mgmtDirect: 25,
    monthlyMax: 250,
  },
  pilot: { days: 90, monthlyBudget: 250, totalBudget: 750 },
  reapplyDays: 60,
  agreementVersion: null, // set when the agreement is published
};

export const STATUSES = ["submitted", "under_review", "info_required", "waitlisted", "approved", "rejected", "withdrawn", "active", "suspended"];
/* What the team can move an application to. */
const DECIDE = new Set(["under_review", "info_required", "waitlisted", "approved", "rejected", "active", "suspended"]);

const MESSAGES = {
  submitted: ["Ambassador application received", "We've received your application. We'll let you know when it moves on."],
  under_review: ["Your application is under review", "The team is reviewing your Ambassador application."],
  info_required: ["More information needed", "The team needs a little more from you. Open the Ambassador tab to reply."],
  waitlisted: ["You're on the waitlist", "You're eligible, but there's no open position right now. We'll be in touch when one opens."],
  approved: ["You're approved", "Welcome to the ALKÉ Ambassador Program. Open the Ambassador tab to complete your onboarding."],
  rejected: ["Application update", "Your Ambassador application wasn't successful this time."],
  withdrawn: ["Application withdrawn", "You've withdrawn your Ambassador application."],
  active: ["Your Ambassador Workspace is active", "Onboarding is complete. Welcome aboard."],
  suspended: ["Ambassador status changed", "Your Ambassador status has been suspended. Open the Ambassador tab for details."],
};

const ref = (db, id) => db.doc(`alke_ambassadors/${id}`);
const ms = (t) => (t && typeof t.toMillis === "function" ? t.toMillis() : Number(t) || 0);
const DAY = 24 * 60 * 60 * 1000;
const str = (v, max) => String(v ?? "").trim().slice(0, max);

function merge(base, over) {
  if (!over || typeof over !== "object" || Array.isArray(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = base && typeof base[k] === "object" && !Array.isArray(base[k]) ? merge(base[k], v) : v;
  return out;
}

export async function config(db) {
  const s = await db.doc("alke_config/ambassador").get();
  return merge(DEFAULTS, s.exists ? s.data() : {});
}

/** Referrals: everyone who joined with [id]'s invite, and how many qualify. */
export async function referrals(db, id, cfg, now = Date.now()) {
  const snap = await db.collection("alke_members").where("invitedBy", "==", id).get();
  const people = snap.docs.filter((d) => d.id !== id);
  const { drills, withinDays } = cfg.qualifying;
  const candidates = people.filter((d) => (Number(d.get("sessionCount")) || 0) >= drills);
  let qualified = 0;
  // The Nth drill has to fall within the window after joining.
  for (let i = 0; i < candidates.length; i += 300) {
    const chunk = candidates.slice(i, i + 300);
    const snaps = await db.getAll(...chunk.map((d) => db.doc(`alke_members/${d.id}/sessions/${drills}`)));
    snaps.forEach((s, k) => {
      const joined = ms(chunk[k].get("createdAt"));
      const at = ms(s.get("startedAt"));
      if (s.exists && joined && at && at - joined <= withinDays * DAY) qualified++;
    });
  }
  const pending = people.filter((d) => (Number(d.get("sessionCount")) || 0) < drills && now - ms(d.get("createdAt")) <= withinDays * DAY).length;
  return { joined: people.length, qualified, pending };
}

/** The checklist, from real data. country: the one the member chose. */
export async function eligibility(db, id, member, country, cfg) {
  const e = cfg.eligibility;
  const refs = await referrals(db, id, cfg);
  const days = Number(member.sessionCount) || 0;
  const c = country ? cfg.countries[country] : null;
  const standing = !(member.suspended || member.banned || member.standing === "bad");
  const items = [
    { id: "days", label: "Active ALKÉ participation", have: Math.min(days, e.activeDays), need: e.activeDays, unit: "days", done: days >= e.activeDays },
    { id: "referrals", label: "Qualifying direct referrals", have: Math.min(refs.qualified, e.directReferrals), need: e.directReferrals, unit: "referrals", done: refs.qualified >= e.directReferrals },
    // Everyone confirmed this age when they signed up; the application asks again.
    { id: "age", label: `Age ${e.minAge} or older`, done: true, note: "Confirmed at sign-up" },
    { id: "country", label: "Eligible country", done: !!c?.open, note: c ? c.name : "Choose your country" },
    { id: "standing", label: "Account in good standing", done: standing },
  ];
  return { items, ok: items.every((i) => i.done), referrals: refs };
}

function publicConfig(cfg) {
  const { countries, eligibility: el, qualifying, compensation, reapplyDays } = cfg;
  return { countries, eligibility: el, qualifying, compensation, reapplyDays };
}

function view(doc) {
  if (!doc) return null;
  const d = doc;
  return {
    country: d.country || null,
    interest: !!d.interest,
    status: d.status || null,
    ref: d.ref || null,
    submittedAt: ms(d.submittedAt) || null,
    decidedAt: ms(d.decidedAt) || null,
    info: d.info || null,
    application: d.application || null,
    timeline: (d.timeline || []).map((t) => ({ status: t.status, at: ms(t.at), note: t.note || "" })),
  };
}

function canReapply(doc, cfg, now = Date.now()) {
  if (!doc?.status) return true;
  if (doc.status === "withdrawn") return true;
  if (doc.status === "rejected") return now - ms(doc.decidedAt) >= cfg.reapplyDays * DAY;
  return false;
}

/* ── Member actions ──────────────────────────────────────────────────── */

export async function memberAction(db, id, data = {}, { email, brevoKey } = {}) {
  const cfg = await config(db);
  const mSnap = await db.doc(`alke_members/${id}`).get();
  if (!mSnap.exists) throw new HttpsError("failed-precondition", "Finish setting up your ALKE account first.");
  const member = mSnap.data();
  const r = ref(db, id);
  const cur = (await r.get()).data() || null;
  const action = data.action || "get";

  if (action === "country") {
    const country = str(data.country, 2).toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) throw new HttpsError("invalid-argument", "Choose your country.");
    const open = !!cfg.countries[country]?.open;
    await r.set({ country, interest: !open, interestAt: open ? null : FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  } else if (action === "apply") {
    if (!canReapply(cur, cfg)) throw new HttpsError("failed-precondition", "You already have an application in progress.");
    const country = cur?.country;
    const el = await eligibility(db, id, member, country, cfg);
    if (!el.ok) throw new HttpsError("failed-precondition", "You don't meet every requirement yet.");
    const a = data.application || {};
    const application = {
      fullName: str(a.fullName, 120),
      email: str(email || a.email, 160),
      country,
      region: str(a.region, 80),
      city: str(a.city, 80),
      languages: str(a.languages, 160),
      socials: str(a.socials, 600),
      experience: str(a.experience, 2000),
      communities: str(a.communities, 2000),
      why: str(a.why, 2000),
      strategy: str(a.strategy, 3000),
    };
    for (const k of ["fullName", "region", "city", "languages", "experience", "why", "strategy"]) {
      if (!application[k]) throw new HttpsError("invalid-argument", "Fill in every required field.");
    }
    const agreed = a.agreed || {};
    if (!["performance", "review", "identity", "nuru", "conduct", "age"].every((k) => agreed[k] === true)) {
      throw new HttpsError("invalid-argument", "Confirm each statement before you submit.");
    }
    const n = await db.runTransaction(async (t) => {
      const c = db.doc("alke_config/ambassadorRefs");
      const next = ((await t.get(c)).get("next") || 0) + 1;
      t.set(c, { next }, { merge: true });
      return next;
    });
    const refNo = `AMB-${country}-${String(n).padStart(5, "0")}`;
    const now = Timestamp.now();
    await r.set(
      {
        country,
        interest: false,
        status: "submitted",
        ref: refNo,
        application,
        stats: {
          drills: Number(member.sessionCount) || 0,
          streak: Number(member.streak) || 0,
          joinedAt: member.createdAt || null,
          referrals: el.referrals,
        },
        info: null,
        submittedAt: now,
        decidedAt: null,
        timeline: [{ status: "submitted", at: now, note: "" }],
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    await tell(db, id, "submitted", { email: application.email, brevoKey, refNo });
  } else if (action === "withdraw") {
    if (!cur?.status || !["submitted", "under_review", "info_required", "waitlisted"].includes(cur.status)) {
      throw new HttpsError("failed-precondition", "There's no application to withdraw.");
    }
    await move(db, id, "withdrawn", "");
  } else if (action === "respond") {
    if (cur?.status !== "info_required") throw new HttpsError("failed-precondition", "Nothing has been asked of you.");
    const text = str(data.text, 3000);
    if (!text) throw new HttpsError("invalid-argument", "Write your reply first.");
    await r.set({ info: { ...(cur.info || {}), reply: text, repliedAt: Timestamp.now() } }, { merge: true });
    await move(db, id, "under_review", "You replied to the team's request.");
  } else if (action !== "get") {
    throw new HttpsError("invalid-argument", "Unknown action.");
  }

  const doc = (await r.get()).data() || null;
  const el = await eligibility(db, id, member, doc?.country, cfg);
  return { config: publicConfig(cfg), eligibility: el, record: view(doc), canApply: canReapply(doc, cfg) && el.ok, email: email || "" };
}

async function move(db, id, status, note) {
  const now = Timestamp.now();
  await ref(db, id).set(
    { status, decidedAt: now, timeline: FieldValue.arrayUnion({ status, at: now, note: note || "" }), updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  await tell(db, id, status, {});
}

async function tell(db, id, status, { email, brevoKey, refNo }) {
  const [title, body] = MESSAGES[status] || MESSAGES.submitted;
  await notify(db, id, { kind: "ambassador", title, body, link: "/ambassador" });
  if (email && brevoKey) {
    try {
      await sendBrevo(brevoKey, { to: email, subject: `${title} · ALKÉ Ambassador`, html: mail(title, body, refNo) });
    } catch (e) {
      logger.warn("ambassador email failed", { id, status, err: String(e?.message || e) });
    }
  }
}

const mail = (title, body, refNo) => `<!doctype html><html><body style="margin:0;background:#08070D;font-family:Inter,Arial,sans-serif;color:#F7F5F2">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08070D;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#14111F;border:1px solid rgba(255,255,255,.09);border-radius:24px;padding:32px 28px">
<tr><td style="font-size:12px;letter-spacing:.24em;color:#F2C66B;font-family:'Courier New',monospace">ALKÉ AMBASSADOR PROGRAM</td></tr>
<tr><td style="padding-top:18px;font-size:22px;font-weight:700;color:#F7F5F2">${title}</td></tr>
<tr><td style="padding-top:10px;font-size:15px;line-height:22px;color:#A9A6B6">${body}</td></tr>
${refNo ? `<tr><td style="padding-top:18px;font-size:14px;color:#A9A6B6">Reference: <b style="color:#F7F5F2;font-family:'Courier New',monospace">${refNo}</b></td></tr>` : ""}
<tr><td style="padding-top:22px;font-size:13px;line-height:19px;color:#8C8999">Track your application in the Ambassador tab of the ALKÉ app. ALKÉ never charges application fees and never asks for your password, seed phrase or private keys.</td></tr>
</table></td></tr></table></body></html>`;

/* ── Team actions ────────────────────────────────────────────────────── */

export async function adminAction(db, adminId, data = {}) {
  const action = data.action || "list";
  if (action === "list") {
    const snap = await db.collection("alke_ambassadors").where("status", "in", ["submitted", "under_review", "info_required", "waitlisted", "approved", "active", "suspended"]).get();
    const out = snap.docs.map((d) => ({ id: d.id, ...view(d.data()), stats: d.get("stats") || null }));
    out.sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0));
    return { applications: out };
  }
  if (action === "decide") {
    const id = str(data.id, 128);
    const status = str(data.status, 20);
    if (!id || !DECIDE.has(status)) throw new HttpsError("invalid-argument", "Choose a valid status.");
    const cur = (await ref(db, id).get()).data();
    if (!cur?.status) throw new HttpsError("not-found", "No application for that member.");
    const note = str(data.note, 2000);
    if (status === "info_required") {
      if (!note) throw new HttpsError("invalid-argument", "Say what information you need.");
      await ref(db, id).set({ info: { request: note, askedAt: Timestamp.now(), by: adminId } }, { merge: true });
    }
    await move(db, id, status, note);
    await db.collection("alke_ambassador_log").add({ id, status, note, by: adminId, at: FieldValue.serverTimestamp() });
    return { ok: true };
  }
  throw new HttpsError("invalid-argument", "Unknown action.");
}

