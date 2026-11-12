/* eslint-disable */
// Generated from the ALKE Network App design (21_17_ALKE_Hex_defeat.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

class Logic extends DCLogic {
  renderVals() {
    const cols = [
      ['x', '.', '.', 'x'],
      ['o', 'o', 't', '.', 'G'],
      ['.', 'o', 'g', 'g', 'o', '.'],
      ['x', 'o', 'g', 'o', 'o', 's', '.'],
      ['t', 'o', 'o', 'o', 'g', 'x'],
      ['.', 'g', 'o', 't', 'x'],
      ['G', 'o', '.', '.']
    ];
    const look = {
      '.': ['#2A2350', 'rgba(198,182,255,.35)', 'none'],
      'o': ['#16141F', 'rgba(255,255,255,.12)', 'none'],
      'g': ['#E9B44C', '#FCE7B5', 'none'],
      'G': ['rgba(242,198,107,.10)', '#F2C66B', '12 9'],
      't': ['#8E1F38', '#FF8A9A', 'none'],
      'x': ['rgba(255,92,122,.08)', 'rgba(255,138,154,.8)', '12 9'],
      's': ['#1C1836', '#6EE7B7', 'none']
    };
    const s = 13;
    const W = s * 11;
    const H = Math.sqrt(3) * s * 7;
    const mini = [];
    cols.forEach((col, ci) => {
      const q = ci - 3;
      const r1 = Math.max(-3, -q - 3);
      col.forEach((ch, k) => {
        const r = r1 + k;
        const lk = look[ch];
        mini.push({
          x: (W / 2 + 1.5 * s * q - s).toFixed(1),
          y: (H / 2 + Math.sqrt(3) * s * (r + q / 2) - (Math.sqrt(3) * s) / 2).toFixed(1),
          fill: lk[0],
          stroke: lk[1],
          dash: lk[2],
          delay: (0.2 + (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))) * 0.08).toFixed(2)
        });
      });
    });
    return {
      mini: mini,
      retry: () => {
        try {
          const raw = window.localStorage.getItem('alke.hex.v1');
          const p = (raw && JSON.parse(raw)) || { v: 1 };
          if (p.v !== 1) return;
          p.pending = { ts: Date.now(), mode: 'level', level: 12 };
          window.localStorage.setItem('alke.hex.v1', JSON.stringify(p));
        } catch (e) {}
      }
    };
  }
}

export default class HexDefeat extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(80% 36% at 50% 12%,rgba(255,60,90,.24) 0%,rgba(255,60,90,0) 70%),radial-gradient(70% 40% at 50% 74%,rgba(110,72,255,.14) 0%,rgba(110,72,255,0) 70%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<main style={{ position: "absolute", inset: "0", overflowY: "auto" }}>{" "}<div style={{ padding: "52px 20px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>{" "}<div style={{ alignSelf: "stretch", display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 -4px" }}>{" "}<Link to="/games/hex" aria-label="Close and go back to ALKE Hex" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"></path></svg></Link>{" "}<span role="img" aria-label="0 of 3 lives left" style={{ display: "flex", gap: "4px", padding: "0 12px", height: "32px", alignItems: "center", borderRadius: "999px", background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,138,154,.2)" }}>{" "}<svg width="18" height="16" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5s-8.5-5.3-8.5-11.4A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11.4-8.5 11.4z" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"></path></svg>{" "}<svg width="18" height="16" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5s-8.5-5.3-8.5-11.4A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11.4-8.5 11.4z" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"></path></svg>{" "}<svg width="18" height="16" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5s-8.5-5.3-8.5-11.4A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11.4-8.5 11.4z" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"></path></svg>{" "}</span>{" "}</div>{" "}<div aria-hidden="true" style={{ position: "relative", width: "130px", height: "146px", flex: "none", animation: "hdSway 3.4s ease-in-out infinite" }}>{" "}<svg width="130" height="146" viewBox="0 0 100 112" style={{ position: "absolute", left: "0", top: "0", overflow: "visible" }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="rgba(255,92,122,.08)" stroke="#FF8A9A" strokeOpacity=".75" strokeWidth="4" strokeLinejoin="round"></path><path d="M50 4 L46 30 L57 44 L44 60 L54 76 L48 108" pathLength="100" strokeDasharray="100" fill="none" stroke="#FF8A9A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "hdCrack .6s .2s ease-out both" }}></path><g fill="none" stroke="#F2C66B" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M50 27 L50 85"></path><path d="M20 45 L32 56 L20 67"></path></g></svg>{" "}<span style={{ position: "absolute", left: "18px", top: "96px", width: "14px", height: "14px", background: "#FF8A9A", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", animation: "hdFall 1.4s .5s ease-in both" }}></span>{" "}<span style={{ position: "absolute", left: "96px", top: "84px", width: "11px", height: "11px", background: "#C2354B", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", animation: "hdFall 1.3s .65s ease-in both" }}></span>{" "}<span style={{ position: "absolute", left: "62px", top: "118px", width: "9px", height: "9px", background: "#F2C66B", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", animation: "hdFall 1.5s .8s ease-in both" }}></span>{" "}</div>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#FF8A9A" }}>{"LEVEL 12 · INTERMEDIATE · ROUND LOST"}</span>{" "}<h1 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "34px", lineHeight: "38px", fontWeight: "600", letterSpacing: "-.03em" }}>{"Out of lives"}</h1>{" "}<span style={{ fontSize: "14px", color: "#A9A6B6" }}>{"5 of 7 pieces placed · 15 of 18 moves used"}</span>{" "}<div style={{ alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px 18px", borderRadius: "22px", background: "rgba(255,92,122,.07)", border: "1px solid rgba(255,138,154,.22)", textAlign: "left" }}>{" "}<span style={{ display: "flex", flexDirection: "column", gap: "3px" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{"Round XP"}</span><span style={{ fontSize: "12px", lineHeight: "17px", color: "#A9A6B6" }}>{"Unbanked XP from this round is gone. Banked XP from earlier rounds stays."}</span></span>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "30px", fontWeight: "600", color: "#FF8A9A", whiteSpace: "nowrap" }}>{"−43 XP"}</span>{" "}</div>{" "}<div style={{ alignSelf: "stretch", display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", borderRadius: "18px", background: "rgba(110,231,183,.07)", border: "1px solid rgba(110,231,183,.2)", textAlign: "left" }}>{" "}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg>{" "}<span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{"Your 31.20 ALKE allocation, 640 contribution score and 12-day mining streak are untouched. A lost round only costs game XP."}</span>{" "}</div>{" "}<section aria-label="Where everything was" style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "14px", padding: "18px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"Where everything was"}</h2><span style={{ fontSize: "12px", color: "#8C8999" }}>{"Learn the board"}</span></div>{" "}<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>{" "}<div role="img" aria-label="Final board: 5 pieces placed, 2 pieces missed, 3 traps hit, 5 traps never found" style={{ position: "relative", width: "143px", height: "158px", flex: "none" }}>{" "}{($.mini || []).map((m, i0) => (<Fragment key={i0}>{" "}<svg width="26" height="22.5" viewBox="0 0 100 86.6" aria-hidden="true" style={{ position: "absolute", left: `${m?.x ?? ''}px`, top: `${m?.y ?? ''}px`, overflow: "visible", animation: `hdIn .35s ${m?.delay ?? ''}s ease-out both` }}><polygon points="26.5,2.6 73.5,2.6 97,43.3 73.5,84 26.5,84 3,43.3" fill={m?.fill} stroke={m?.stroke} strokeWidth="6" strokeDasharray={m?.dash} strokeLinejoin="round"></polygon></svg>{" "}</Fragment>))}{" "}</div>{" "}<ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "9px", textAlign: "left", fontSize: "12px", color: "#D8D5E2" }}><li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#E9B44C", flex: "none" }}></span>{"Placed · 5"}</li><li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", border: "1.5px dashed #F2C66B", boxSizing: "border-box", flex: "none" }}></span>{"Missed piece · 2"}</li><li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#8E1F38", border: "1.5px solid #FF8A9A", boxSizing: "border-box", flex: "none" }}></span>{"Ember hit · 3"}</li><li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", border: "1.5px dashed rgba(255,138,154,.8)", boxSizing: "border-box", flex: "none" }}></span>{"Trap not found · 5"}</li><li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#1C1836", border: "1.5px solid #6EE7B7", boxSizing: "border-box", flex: "none" }}></span>{"Shield used · 1"}</li></ul>{" "}</div>{" "}</section>{" "}<p style={{ margin: "0", fontSize: "13px", lineHeight: "19px", color: "#A9A6B6" }}>{"Tip: a gold rim means a piece is touching that tile. Follow the rims before you guess."}</p>{" "}<div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>{" "}<Link to="/games/hex/play" onClick={$.retry} style={{ height: "56px", borderRadius: "999px", background: "linear-gradient(135deg,#F7D58A 0%,#E2A93B 55%,#C98A1E 100%)", color: "#1A1205", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(217,154,43,.85),inset 0 1px 0 rgba(255,255,255,.5)" }}>{"Try level 12 again"}</Link>{" "}<Link to="/games/hex" style={{ height: "46px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", color: "#C6B6FF" }}>{"Back to ALKE Hex"}</Link>{" "}</div>{" "}</div>{" "}</main>{" "}</div>{" "}</>);
  }
}
