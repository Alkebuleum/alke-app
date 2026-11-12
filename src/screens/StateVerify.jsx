/* eslint-disable */
// Generated from the ALKE Network App design (33_Verification.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

class Logic extends DCLogic {
  renderVals() {
    const s = this.state || {};
    const pick = s.method || 'afpass';
    const defs = [
      { id: 'afpass', title: 'Verify with AfPass', body: 'Digital ID from the Alkebuleum ecosystem. Takes about two minutes.', rec: true, cta: 'Continue with AfPass', tint: 'rgba(139,109,255,.16)', ink: '#C6B6FF', icon: 'M5 6h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 18H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 6zM7 10.5h4M7 13.5h2.5M15.5 10.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 1 0 0-3.6z' },
      { id: 'vouch', title: 'Three member vouches', body: 'Verified members who know you confirm it. You have 1 of 3.', rec: false, cta: 'Ask for vouches', tint: 'rgba(74,134,247,.16)', ink: '#8FB2FF', icon: 'M9 5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7zM2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.6 3 5.2' },
      { id: 'live', title: 'Liveness check', body: 'A short selfie video, deleted once the check is complete.', rec: false, cta: 'Start liveness check', tint: 'rgba(110,231,183,.13)', ink: '#6EE7B7', icon: 'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 10v.5M15 10v.5M9.5 15c1.4 1 3.6 1 5 0' }
    ];
    const cur = defs.find((d) => d.id === pick) || defs[0];
    return {
      methods: defs.map((d) => {
        const on = d.id === pick;
        return {
          id: d.id,
          title: d.title,
          body: d.body,
          rec: d.rec,
          tint: d.tint,
          ink: d.ink,
          icon: d.icon,
          checked: on,
          border: on ? 'rgba(160,138,255,.75)' : 'rgba(255,255,255,.08)',
          bg: on ? 'linear-gradient(135deg,rgba(124,90,255,.22),rgba(124,90,255,.05))' : 'rgba(255,255,255,.035)',
          glow: on ? '0 14px 30px -16px rgba(110,72,255,.95)' : 'none',
          ringBorder: on ? '0' : '2px solid rgba(255,255,255,.22)',
          ringBg: on ? 'linear-gradient(135deg,#9B7DFF,#5530E8)' : 'transparent',
          ringGlow: on ? '0 0 12px rgba(139,109,255,.8)' : 'none',
          dotOp: on ? '1' : '0',
          pick: () => this.setState({ method: d.id })
        };
      }),
      cta: cur.cta
    };
  }
}

export default class StateVerify extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 46% at 50% -6%,rgba(110,72,255,.36) 0%,rgba(110,72,255,0) 72%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<main style={{ position: "absolute", inset: "0", overflowY: "auto" }}>{" "}<div style={{ padding: "52px 20px 124px", display: "flex", flexDirection: "column", gap: "16px" }}>{" "}<div style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center", margin: "0 -4px" }}>{" "}<Link to="/settings" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg></Link>{" "}<span style={{ textAlign: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"Verification"}</span>{" "}<span></span>{" "}</div>{" "}<div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "6px" }}>{" "}<svg width="56" height="63" viewBox="0 0 100 112" aria-hidden="true" style={{ flex: "none", filter: "drop-shadow(0 10px 22px rgba(110,72,255,.6))" }}><defs><linearGradient id="vfG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A88CFF"></stop><stop offset="1" stopColor="#4C2BD9"></stop></linearGradient></defs><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="url(#vfG)" stroke="#E4DBFF" strokeOpacity=".55" strokeWidth="2.5" strokeLinejoin="round"></path><g transform="translate(50 56) scale(2) translate(-12 -12)" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z"></path><path d="M12 9.5v3.5M12 16v.01"></path></g></svg>{" "}<span role="status" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", padding: "0 12px", borderRadius: "999px", background: "rgba(242,198,107,.12)", border: "1px solid rgba(242,198,107,.26)", color: "#F2C66B", fontSize: "13px", fontWeight: "600" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path></svg>{"Not verified yet"}</span>{" "}</div>{" "}<h1 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "30px", lineHeight: "34px", fontWeight: "600", letterSpacing: "-.03em" }}>{"Confirm you're one real person"}</h1>{" "}<p style={{ margin: "0", fontSize: "15px", lineHeight: "23px", color: "#A9A6B6" }}>{"It keeps the network fair: one person, one account. Until you're verified, your sessions stay Pending. Nothing is lost."}</p>{" "}<fieldset style={{ margin: "4px 0 0", padding: "0", border: "0", minWidth: "0", display: "flex", flexDirection: "column", gap: "10px" }}>{" "}<legend style={{ padding: "0", marginBottom: "10px", fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#8C8999" }}>{"CHOOSE A METHOD"}</legend>{" "}{($.methods || []).map((m, i0) => (<Fragment key={i0}>{" "}<label className="vmeth" style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px", borderRadius: "22px", border: `1px solid ${m?.border ?? ''}`, background: m?.bg, boxShadow: m?.glow, boxSizing: "border-box", cursor: "pointer" }}>{" "}<input type="radio" name="verify" value={m?.id} checked={m?.checked} onChange={m?.pick} style={{ position: "absolute", opacity: "0", width: "1px", height: "1px", margin: "0", pointerEvents: "none" }} />{" "}<span aria-hidden="true" style={{ width: "42px", height: "42px", borderRadius: "14px", background: m?.tint, color: m?.ink, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={m?.icon}></path></svg></span>{" "}<span style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1", minWidth: "0" }}><span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "16px", fontWeight: "600" }}>{m?.title}</span>{m?.rec ? (<><span style={{ display: "inline-flex", alignItems: "center", height: "20px", padding: "0 8px", borderRadius: "999px", background: "rgba(110,231,183,.14)", color: "#6EE7B7", fontSize: "11px", fontWeight: "600" }}>{"Recommended"}</span></>) : null}</span><span style={{ fontSize: "13px", lineHeight: "19px", color: "#A9A6B6" }}>{m?.body}</span></span>{" "}<span aria-hidden="true" style={{ marginTop: "10px", width: "24px", height: "24px", borderRadius: "50%", boxSizing: "border-box", border: m?.ringBorder, background: m?.ringBg, boxShadow: m?.ringGlow, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFFFFF", opacity: m?.dotOp }}></span></span>{" "}</label>{" "}</Fragment>))}{" "}</fieldset>{" "}<div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", borderRadius: "18px", background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)" }}>{" "}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6B6FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }}><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg>{" "}<span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{"Your documents and images never appear in ALKE Network or on the blockchain. The app only learns whether the check passed."}</span>{" "}</div>{" "}</div>{" "}</main>{" "}<div style={{ position: "absolute", left: "0", right: "0", bottom: "0", padding: "22px 20px 30px", background: "linear-gradient(180deg,rgba(8,7,13,0) 0%,rgba(8,7,13,.94) 38%,#08070D 100%)" }}>{" "}<Link to="/home" style={{ height: "56px", borderRadius: "999px", background: "linear-gradient(135deg,#7A55FA 0%,#6236F5 50%,#5530E8 100%)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600", textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(110,72,255,.95),inset 0 1px 0 rgba(255,255,255,.22)" }}>{$.cta}</Link>{" "}</div>{" "}</div>{" "}</>);
  }
}
