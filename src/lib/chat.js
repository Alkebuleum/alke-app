/* The Alkers community chat, shared with the Nuru app.
 *
 * Same Firestore data as Nuru (chats/{id}, members, messages) and the same
 * writes as Nuru's chats_repository.dart, so messages show up in both apps.
 * Identity is the session's Nuru ID (the `nid` claim) — what Nuru's chat
 * rules check. Basic features only: read and send text; everything else
 * (media, polls, calls, push) stays in Nuru.
 *
 * The invite code is the Alké Network community's. Joining the community
 * also joins its General group, which is the Alkers chat.
 */
import { collection, deleteField, doc, getDoc, increment, limit, onSnapshot, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

export const COMMUNITY_INVITE = "cpnPQgBCZiuVyKuSGZi5BU";
export const NURU_CHAT_LINK = `https://amid-7592b.web.app/join.html?code=${COMMUNITY_INVITE}&n=${encodeURIComponent("Alké Network")}`;

const chatRef = (id) => doc(db, "chats", id);
const memberRef = (id, ain) => doc(db, "chats", id, "members", ain);

async function readOrNull(ref) {
  try {
    const s = await getDoc(ref);
    return s.exists() ? s.data() : null;
  } catch (e) {
    if (e?.code === "permission-denied") return null;
    throw e;
  }
}

/** The community and its General (Alkers) chat, from the invite. */
export async function resolveAlkers() {
  const inv = await readOrNull(doc(db, "chat_invites", COMMUNITY_INVITE));
  if (!inv || !inv.chatId) throw new Error("The community invite isn't valid any more.");
  const community = await readOrNull(chatRef(inv.chatId));
  const generalId = (community && community.generalId) || inv.generalId || "";
  if (!generalId) throw new Error("Couldn't find the community chat.");
  return { communityId: inv.chatId, chatId: generalId, name: inv.name || "Alké Network" };
}

/** Am I in [chatId]? (A member record I can read, not deleted.) */
export async function isMember(chatId, me) {
  const m = await readOrNull(memberRef(chatId, me));
  return !!m && !m.deletedAt;
}

const member = (ain, name, extra = {}) => ({ ain, role: "member", name, readCount: 0, joinedAt: serverTimestamp(), ...extra });

/** Adds me to a chat in [b], unless my record already exists (rewriting it is refused). */
async function addMe(b, chatId, me, record) {
  const ref = memberRef(chatId, me);
  let mine = null;
  try {
    const s = await getDoc(ref);
    mine = s.exists() ? s.data() : null;
  } catch (e) {
    if (e?.code !== "permission-denied") throw e;
  }
  if (mine) {
    if (mine.deletedAt) b.update(ref, { deletedAt: deleteField() });
    return;
  }
  b.set(ref, record);
  b.update(chatRef(chatId), { memberCount: increment(1) });
}

/** Joins the community with its invite code, and its General (Alkers) chat, in one batch. */
export async function joinAlkers({ communityId, chatId }, me, name) {
  const b = writeBatch(db);
  await addMe(b, communityId, me, member(me, name, { invite: COMMUNITY_INVITE }));
  await addMe(b, chatId, me, member(me, name));
  await b.commit();
}

/** The latest [count] messages, oldest first. */
export function watchMessages(chatId, cb, onError, count = 60) {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "desc"), limit(count));
  return onSnapshot(
    q,
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() })).reverse()),
    onError,
  );
}

/** The chat itself (name, member count, settings). */
export function watchChat(chatId, cb, onError) {
  return onSnapshot(chatRef(chatId), (s) => cb(s.exists() ? s.data() : null), onError);
}

/** Sends a text message: the message plus the chat's lastMessage / msgCount, together (the rules require both). */
export async function sendText(chatId, me, name, text) {
  const t = String(text || "").trim().slice(0, 4000);
  if (!t) return;
  const b = writeBatch(db);
  const msg = doc(collection(db, "chats", chatId, "messages"));
  b.set(msg, { senderAin: me, senderName: name, type: "text", text: t, createdAt: serverTimestamp() });
  b.update(chatRef(chatId), {
    lastMessage: { text: t.length > 160 ? `${t.slice(0, 160)}…` : t, senderAin: me, senderName: name, at: serverTimestamp() },
    msgCount: increment(1),
    updatedAt: serverTimestamp(),
  });
  await b.commit();
}

/** What to show for a message this app doesn't render in full. */
export function previewOf(m) {
  if (m.deleted) return { kind: "note", text: "Message deleted" };
  switch (m.type) {
    case "text":
    case "nuru":
      return { kind: "text", text: m.text || "" };
    case "system":
      return { kind: "system", text: m.text || "" };
    case "image":
      return { kind: "media", text: m.text ? `Photo · ${m.text}` : "Photo" };
    case "video":
      return { kind: "media", text: "Video" };
    case "voice":
      return { kind: "media", text: "Voice message" };
    case "file":
      return { kind: "media", text: `File · ${m.media?.name || "attachment"}` };
    case "poll":
      return { kind: "media", text: `Poll · ${m.text || ""}` };
    case "event":
      return { kind: "media", text: `Event · ${m.text || ""}` };
    case "payment":
      return { kind: "media", text: "Payment" };
    default:
      return { kind: "media", text: m.text || "Message" };
  }
}
