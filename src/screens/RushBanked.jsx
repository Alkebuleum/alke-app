/* eslint-disable */
// Generated from the ALKE Network App design (22_22_ALKE_Rush_banked_victory_.html). Edit the logic freely;
// The layout is hand-built on the app shell (src/ui/shell.jsx).
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";
import { Bar, Button, Notice, Page } from "../ui/ob";
import { AppPage, Ico, Row, Section, Stat, SubBar } from "../ui/shell";

const tc = (s) => String(s).split(" · ").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(" · ");

class Logic extends DCLogic {
  load() {
    try {
      const raw = window.localStorage.getItem('alke.rush.v1');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.v === 1) return p;
      }
    } catch (e) {}
    return null;
  }
  renderVals() {
    const s = this.state || {};
    const p = this.load();
    const sample = {
      result: 'banked', how: 'manual', banked: 250, bonus: 50, used: 4, left: 1, blocked: 0,
      newBest: true, best: 250, streak: 3, badge: 'cool', xp: 480, practice: false, runNo: 3, chalDone: true, chalBest: 250,
      stops: [
        { k: 'xp50', d: 50, tone: 'good', at: 50, mult: 1 },
        { k: 'shield', d: 0, tone: 'power', at: 50, mult: 1 },
        { k: 'boost', d: 0, tone: 'power', at: 50, mult: 1 },
        { k: 'xp100', d: 200, tone: 'good', at: 250, mult: 2 }
      ]
    };
    const last = p && p.last && p.last.result === 'banked' ? p.last : sample;
    const banked = last.banked || 0;
    const practice = !!last.practice;

    const title = practice ? 'Practice, banked' : banked >= 250 ? 'Cool head' : banked >= 100 ? 'Banked. Good call.' : 'Safe and sound';
    const chips = [];
    if (last.bonus > 0) chips.push({ t: 'Challenge bonus +' + last.bonus + ' XP', bg: 'rgba(242,198,107,.16)', ink: '#F2C66B' });
    if (last.newBest) chips.push({ t: 'New best run', bg: 'rgba(76,214,228,.16)', ink: '#7FE9EE' });
    if (practice) chips.push({ t: 'Practice · not scored', bg: 'rgba(255,255,255,.08)', ink: '#D8D5E2' });
    if (!chips.length) chips.push({ t: 'Rush total ' + (last.xp || 0) + ' XP', bg: 'rgba(255,255,255,.08)', ink: '#D8D5E2' });

    const names = { xp20: '+20', xp50: '+50', xp100: '+100', boost: '×2', shield: 'Shield', spin: '+1 spin', streak: 'Streak', mystery: 'Mystery', trap: 'Trap', leak: 'Leak', drain: 'Drain', reset: 'Reset', glitch: 'Glitch' };
    const stops = (last.stops || []).slice(-6);
    const path = stops.map((st, i) => {
      let t = names[st.k] || st.k, bg = 'rgba(255,255,255,.06)', edge = 'rgba(255,255,255,.10)', ink = '#D8D5E2';
      if (st.tone === 'good') { t = '+' + st.d + (st.mult > 1 ? ' ×' + st.mult : ''); bg = 'rgba(242,198,107,.12)'; edge = 'rgba(242,198,107,.32)'; ink = '#F2C66B'; }
      else if (st.tone === 'power') { bg = 'rgba(139,109,255,.14)'; edge = 'rgba(160,138,255,.36)'; ink = '#C6B6FF'; }
      else if (st.tone === 'blocked') { t = t + ' blocked'; bg = 'rgba(110,231,183,.12)'; edge = 'rgba(110,231,183,.34)'; ink = '#6EE7B7'; }
      else if (st.tone === 'bad') { t = t + (st.d < 0 ? ' −' + (-st.d) : ''); bg = 'rgba(255,92,122,.12)'; edge = 'rgba(255,138,154,.34)'; ink = '#FF8A9A'; }
      else if (st.tone === 'miss') { bg = 'rgba(255,255,255,.05)'; edge = 'rgba(255,138,154,.22)'; ink = '#A9A6B6'; }
      return { t: t, bg: bg, edge: edge, ink: ink, arrow: 'inline' };
    });

    const streak = last.streak || 0;
    const week = [];
    for (let i = 0; i < 7; i++) {
      const on = i < Math.min(7, streak);
      week.push({ bg: on ? 'linear-gradient(90deg,#F7D58A,#F7B267)' : 'rgba(255,255,255,.08)', glow: on && i === Math.min(7, streak) - 1 ? '0 0 10px rgba(247,178,103,.8)' : 'none' });
    }
    const bonusNext = Math.min(100, 20 * (streak + 1));

    const B = {
      first: ['First Bank', 'You banked your first run', 'M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4zM8.5 12.2l2.4 2.4 4.6-4.8'],
      cool: ['Cool Head', 'Banked 250 or more in one run', 'M12 21a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM12 9.5v4l2.5 1.5M10 2.5h4M18.5 6.5l1.5-1.5'],
      firewall: ['Firewall', 'Blocked 3 hazards with shields', 'M3.5 6.5h17v11h-17zM3.5 12h17M9 6.5V12M15 12v5.5'],
      overclock: ['Overclock', 'Stacked a ×4 boost', 'M13 2.5 5 13.5h6l-1 8 8-11h-6z'],
      close: ['Close Call', 'Banked right after a shield block', 'M3 12h4l2-5 4 10 2-5h6'],
      steady: ['Steady Hand', 'Banked on 5 days in a week', 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4M9 15l2 2 4-4']
    };
    const bd = last.badge && B[last.badge] ? B[last.badge] : null;

    const sampleBoard = [420, 380, 350, 300, 260, 240, 210, 190];
    const bestToday = Math.max(last.chalBest || 0, practice ? 0 : banked);
    const rank = bestToday > 0 ? 1 + sampleBoard.filter((v) => v > bestToday).length : 0;
    const gap = rank > 1 ? sampleBoard[rank - 2] - bestToday : 0;

    const total = (last.used || 0) + (last.left || 0);
    return {
      streakChip: streak + (streak === 1 ? '-day streak' : '-day streak'),
      tag: practice ? 'PRACTICE RUN · NOT SCORED' : 'SCORED RUN ' + (last.runNo || 1) + ' OF 5 · BANKED',
      title: title,
      bankedText: '+' + banked,
      bankedUnit: practice ? 'XP, practice' : 'game XP banked',
      chips: chips,
      spinsValue: (last.used || 0) + ' / ' + (total || 5),
      blockedValue: String(last.blocked || 0),
      bestValue: String(last.best || banked),
      howNote: last.how === 'auto' ? 'Banked on the last spin' : 'You banked with ' + (last.left || 0) + (last.left === 1 ? ' spin' : ' spins') + ' to spare',
      path: path,
      streakTitle: streak ? streak + '-day Rush streak' : 'Start a streak',
      streakBonus: 'Streak node pays +' + Math.min(100, 20 * Math.max(1, streak)),
      streakAria: streak + ' of 7 days',
      week: week,
      streakNote: practice ? 'Practice runs don’t count toward your streak.' : 'Bank a scored run tomorrow to make it ' + (streak + 1) + ' days. Your streak node would pay +' + bonusNext + ' XP.',
      hasBadge: !!bd && !practice,
      badgeName: bd ? bd[0] : '',
      badgeHow: bd ? bd[1] : '',
      badgeIcon: bd ? bd[2] : '',
      rankValue: rank ? '#' + rank : '—',
      rankTitle: rank ? 'You’re #' + rank + ' on today’s board' : 'Not on today’s board yet',
      rankNote: rank === 1 ? 'Top of the board. Ties go to whoever banked first.' : rank ? gap + ' XP behind #' + (rank - 1) + '. Best single run counts.' : 'Practice runs don’t rank. Bank a scored run to join.',
      shareLine: 'ALKE Rush · +' + banked + ' XP · ' + (last.used || 0) + ' spins',
      copyLabel: s.copied ? 'Copied' : 'Copy',
      copy: () => {
        try { if (navigator.clipboard) navigator.clipboard.writeText('ALKE Rush · +' + banked + ' XP in ' + (last.used || 0) + ' spins'); } catch (e) {}
        this.setState({ copied: true });
      },
      againLabel: practice ? 'Practice again' : 'Run again'
    };
  }
}

export default class RushBanked extends Logic {
  render() {
    const $ = this.vals();
    return (
      <Page
        bar={<Bar back="/games/rush" />}
        footer={
          <>
            <Button to="/games/rush/play">{$.againLabel}</Button>
            <Button kind="ghost" to="/games/rush/leaderboards">
              Challenges and leaderboards
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, paddingTop: 8 }}>
          <span className="ob-tile" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
            <Ico.Check size={30} />
          </span>
          <p className="ob-eyebrow" style={{ margin: "8px 0 0", color: "var(--text-3)" }}>
            {tc($.tag)}
          </p>
          <div className="num" style={{ fontSize: 48, fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>
            {$.bankedText}
          </div>
          <div style={{ fontSize: 15, color: "var(--text-2)" }}>{$.bankedUnit}</div>
          <h1 className="ob-title" style={{ fontSize: 22, marginTop: 6 }}>
            {$.title}
          </h1>
          <div className="ob-chips" style={{ justifyContent: "center", marginTop: 4 }}>
            {$.chips.map((c) => (
              <span key={c.t} className="ob-pill" style={{ color: c.ink }}>
                {c.t}
              </span>
            ))}
          </div>
        </div>

        <div className="ob-stats">
          <Stat label="Spins" value={$.spinsValue} />
          <Stat label="Blocked" value={$.blockedValue} />
          <Stat label="Best run" value={$.bestValue} />
        </div>

        {$.path.length ? (
          <Section title="Your run" action={<span>{$.howNote}</span>}>
            <div className="ob-chips">
              {$.path.map((p, i) => (
                <span key={i} className="ob-pill" style={{ color: p.ink, height: 28 }}>
                  {p.t}
                </span>
              ))}
            </div>
          </Section>
        ) : null}

        {$.hasBadge ? (
          <ul className="ob-list">
            <li>
              <Row
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={$.badgeIcon} />
                  </svg>
                }
                tone="gold"
                title={`New badge · ${$.badgeName}`}
                sub={$.badgeHow}
              />
            </li>
          </ul>
        ) : null}

        <p className="ob-small center">
          <Ico.Flame size={13} /> {$.streakTitle}
        </p>
      </Page>
    );
  }
}
