import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { watchAllocation, watchEntries, watchSessions } from "./member";

/* Live member data for a screen: pass what it needs, e.g.
   useMemberData({ sessions: true, allocation: true }). undefined = loading. */
export function useMemberData({ sessions = false, allocation = false, entries = false } = {}) {
  const { nuruId } = useAuth();
  const [data, setData] = useState({ sessions: undefined, allocation: undefined, entries: undefined, error: null });

  useEffect(() => {
    if (!nuruId) return;
    const offs = [];
    const onError = (e) => setData((d) => ({ ...d, error: e.message || String(e) }));
    if (sessions) offs.push(watchSessions(nuruId, (v) => setData((d) => ({ ...d, sessions: v })), onError));
    if (allocation) offs.push(watchAllocation(nuruId, (v) => setData((d) => ({ ...d, allocation: v })), onError));
    if (entries) offs.push(watchEntries(nuruId, (v) => setData((d) => ({ ...d, entries: v })), onError));
    return () => offs.forEach((off) => off());
  }, [nuruId, sessions, allocation, entries]);

  return data;
}

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** For the last [n] days (oldest first): whether a session started that day. */
export function lastDays(sessions, n = 7, now = new Date()) {
  const started = new Set((sessions || []).map((s) => s.startedAt?.toDate?.()).filter(Boolean).map(dayKey));
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (n - 1 - i));
    return { date: d, done: started.has(dayKey(d)), today: i === n - 1 };
  });
}
