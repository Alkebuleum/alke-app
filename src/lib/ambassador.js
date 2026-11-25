/* ALKÉ Ambassador Program (app side).
 *
 * Everything real comes from the server (functions/ambassador.js) through
 * one callable: settings, the eligibility checklist and the member's own
 * application. The app never decides eligibility or pay.
 *
 * No crypto here: ALKE has no wallets or payments. Ambassador pay is only
 * described in this app; it's paid and tracked in the Nuru app.
 *
 * MOCK below is for the dev preview (/__preview/ambassador?state=…) only.
 */
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const call = (name) => async (data) => (await httpsCallable(functions, name)(data)).data;
const amb = call("alkeAmbassador");

export const ambassador = {
  get: () => amb({ action: "get" }),
  setCountry: (country) => amb({ action: "country", country }),
  apply: (application) => amb({ action: "apply", application }),
  withdraw: () => amb({ action: "withdraw" }),
  respond: (text) => amb({ action: "respond", text }),
};
export const ambassadorAdmin = {
  list: () => call("alkeAmbassadorAdmin")({ action: "list" }),
  decide: (id, status, note = "") => call("alkeAmbassadorAdmin")({ action: "decide", id, status, note }),
};

export const NURU_URL = "https://nuru.si";

/* Status names and what they mean, for the tracker. */
export const STATUS = {
  submitted: ["Submitted", "Application successfully received"],
  under_review: ["Under review", "Your application is being evaluated"],
  info_required: ["More information needed", "The team needs a little more from you"],
  waitlisted: ["Waitlisted", "Eligible, but no position is open right now"],
  approved: ["Approved", "Accepted into the program"],
  rejected: ["Not successful", "Your application wasn't successful this time"],
  withdrawn: ["Withdrawn", "You withdrew your application"],
  active: ["Active", "Your Ambassador Workspace is active"],
  suspended: ["Suspended", "Your Ambassador status is suspended"],
};
export const statusLabel = (s) => STATUS[s]?.[0] || s;

/** The monthly estimate from qualifying referrals (not guaranteed; the team approves real pay). */
export function estimate(c, { direct = 0, indirect = 0, tasksDone = true } = {}) {
  const d = direct * c.direct;
  const i = c.indirectEnabled ? indirect * c.indirect : 0;
  const mgmt = tasksDone && direct + indirect >= c.mgmtCombined && direct >= c.mgmtDirect ? c.managementFee : 0;
  const raw = d + i + mgmt;
  return { direct: d, indirect: i, mgmt, total: Math.min(raw, c.monthlyMax), capped: raw > c.monthlyMax };
}
/** "$250", "$0.40", "$105.50": pay amounts in dollars (whole amounts without cents). */
export const money = (v) => {
  const n = Number(v) || 0;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
};

/* ── Dev preview data ─────────────────────────────────────────────────── */

const CONFIG = {
  countries: { NG: { name: "Nigeria", open: true, positions: 1 } },
  eligibility: { activeDays: 14, directReferrals: 25, minAge: 18 },
  qualifying: { drills: 7, withinDays: 30 },
  compensation: { currency: "USDC", direct: 0.4, indirect: 0.2, indirectEnabled: false, managementFee: 25, mgmtCombined: 100, mgmtDirect: 25, monthlyMax: 250 },
  reapplyDays: 60,
};
const items = (days, refs, country = "NG") => [
  { id: "days", label: "Active ALKÉ participation", have: Math.min(days, 14), need: 14, unit: "days", done: days >= 14 },
  { id: "referrals", label: "Qualifying direct referrals", have: Math.min(refs, 25), need: 25, unit: "referrals", done: refs >= 25 },
  { id: "age", label: "Age 18 or older", done: true, note: "Confirmed at sign-up" },
  { id: "country", label: "Eligible country", done: country === "NG", note: country === "NG" ? "Nigeria" : country ? "Not open yet" : "Choose your country" },
  { id: "standing", label: "Account in good standing", done: true },
];
const D = 24 * 60 * 60 * 1000;
const t0 = Date.parse("2026-11-20T10:00:00Z");
const APP = { fullName: "Ada Obi", email: "ada@example.com", country: "NG", region: "Lagos", city: "Ikeja", languages: "English, Yoruba", socials: "x.com/ada", experience: "Ran a 2,000-member student group", communities: "Campus tech club", why: "Bring ALKÉ to Lagos", strategy: "Campus meetups and weekly drill clinics" };
const rec = (status, extra = {}) => ({
  country: "NG",
  interest: false,
  status,
  ref: "AMB-NG-00001",
  submittedAt: t0,
  decidedAt: t0 + 2 * D,
  application: APP,
  info: null,
  timeline: [{ status: "submitted", at: t0, note: "" }, ...(status !== "submitted" ? [{ status, at: t0 + 2 * D, note: "" }] : [])],
  ...extra,
});
const res = (record, days = 14, refs = 25, canApply = false, country = "NG") => {
  const it = items(days, refs, country);
  return { config: CONFIG, eligibility: { items: it, ok: it.every((i) => i.done), referrals: { joined: refs + 6, qualified: refs, pending: 4 } }, record, canApply, email: "ada@example.com" };
};

export const MOCK = {
  intro: res(null, 10, 18, false, null),
  interest: res({ country: "GH", interest: true, status: null, timeline: [] }, 20, 30, false, "GH"),
  eligible: res({ country: "NG", interest: false, status: null, timeline: [] }, 14, 25, true),
  submitted: res(rec("submitted")),
  under_review: res(rec("under_review")),
  info_required: res(rec("info_required", { info: { request: "Please share a link to the community you manage." } })),
  waitlisted: res(rec("waitlisted")),
  rejected: res(rec("rejected")),
  withdrawn: res(rec("withdrawn"), 14, 25, true),
  approved: res(rec("approved")),
  active: res(rec("active")),
  suspended: res(rec("suspended", { timeline: [{ status: "submitted", at: t0, note: "" }, { status: "suspended", at: t0 + 30 * D, note: "Misleading promotional claims were reported. Contact the team to review." }] })),
};

/* The workspace (preview only until the backend exists). */
export const MOCK_WORKSPACE = {
  id: "AMB-NG-00001",
  name: "Ada Obi",
  country: "Nigeria",
  period: "November 2026",
  metrics: { direct: 100, directQualified: 62, indirect: 200, indirectQualified: 118, newVerified: 41, activeMembers: 236, retention: 0.71, community: 300 },
  weekly: [12, 18, 15, 24, 31, 27, 36, 40],
  branches: [
    { name: "Chidi", joined: 34, qualified: 21 },
    { name: "Ngozi", joined: 28, qualified: 17 },
    { name: "Tunde", joined: 19, qualified: 9 },
    { name: "Amaka", joined: 11, qualified: 4 },
  ],
  referralStates: { Registered: 38, "Participation pending": 52, "Under review": 6, Qualified: 180, Disqualified: 4 },
  assignments: [
    { id: "a1", title: "Host a community introduction session", due: "Dec 5", status: "In progress", evidence: "Photo + attendee count" },
    { id: "a2", title: "Help new members understand drilling", due: "Dec 10", status: "Assigned", evidence: "Short report" },
    { id: "a3", title: "Submit the weekly community growth report", due: "Nov 29", status: "Completed", evidence: "Report", feedback: "Clear and useful, thank you." },
  ],
  resources: [
    { title: "ALKÉ brand kit", kind: "Brand assets", url: "https://alke.network/brand" },
    { title: "Approved talking points", kind: "Guide" },
    { title: "Community onboarding guide", kind: "Guide" },
    { title: "Marketing compliance guidelines", kind: "Rules" },
  ],
  ledger: [
    { date: "Nov 24", type: "Qualifying direct referral", ref: "Referral · Kelechi", amount: 0.4, status: "Pending" },
    { date: "Nov 23", type: "Qualifying direct referral", ref: "Referral · Ifeoma", amount: 0.4, status: "Approved" },
    { date: "Nov 20", type: "Management fee", ref: "November 2026", amount: 25, status: "Pending" },
  ],
};
