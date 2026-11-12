/* eslint-disable */
// Generated from the ALKE Network App design (06_05_Your_profile.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

class Logic extends DCLogic {
  renderVals() {
    const s = this.state || {};
    const user = s.user != null ? s.user : 'ama.builds';
    const name = s.name != null ? s.name : 'Ama Owusu';
    const invite = s.invite != null ? s.invite : 'KOFI-3M8D';
    const picked = s.picked != null ? s.picked : 0;
    const colors = [
      { hex: '#8B6DFF', label: 'Violet' },
      { hex: '#F2C66B', label: 'Gold' },
      { hex: '#6EE7B7', label: 'Mint' },
      { hex: '#8FB2FF', label: 'Sky' },
      { hex: '#F7F5F2', label: 'Bone' }
    ];
    const words = name.trim().split(/\s+/).filter(Boolean);
    let initials = words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    if (!initials) initials = (user[0] || 'A').toUpperCase();
    const ok = /^[a-z0-9._]{3,20}$/i.test(user);
    return {
      user, name, invite, initials,
      avatarBg: colors[picked].hex,
      userOk: ok,
      userShort: !ok,
      swatches: colors.map((c, i) => ({
        hex: c.hex,
        label: c.label + ' avatar',
        on: i === picked ? 'true' : 'false',
        ring: i === picked ? '0 0 0 3px #08070D, 0 0 0 5px #C6B6FF' : 'none',
        pick: () => this.setState({ picked: i })
      })),
      onUser: (e) => this.setState({ user: e.target.value }),
      onName: (e) => this.setState({ name: e.target.value }),
      onInvite: (e) => this.setState({ invite: e.target.value.toUpperCase() })
    };
  }
}

export default class ProfileSetup extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 46% at 50% -6%,rgba(110,72,255,.36) 0%,rgba(110,72,255,0) 72%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<div style={{ position: "absolute", top: "52px", left: "16px", right: "16px", height: "44px", display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center" }}>{" "}<Link to="/sign-up" aria-label="Back" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg></Link>{" "}<span style={{ textAlign: "center", fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#8C8999" }}>{"STEP 2 OF 3"}</span>{" "}<span></span>{" "}</div>{" "}<div aria-hidden="true" style={{ position: "absolute", top: "104px", left: "20px", right: "20px", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "6px" }}><span style={{ height: "3px", borderRadius: "3px", background: "linear-gradient(90deg,#C6B6FF,#8B6DFF)" }}></span><span style={{ height: "3px", borderRadius: "3px", background: "linear-gradient(90deg,#C6B6FF,#8B6DFF)" }}></span><span style={{ height: "3px", borderRadius: "3px", background: "rgba(255,255,255,.1)" }}></span></div>{" "}<div style={{ position: "absolute", top: "132px", left: "20px", right: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>{" "}<h1 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "30px", lineHeight: "34px", fontWeight: "600", letterSpacing: "-.03em" }}>{"How should Alkers"}<br />{"know you?"}</h1>{" "}<div style={{ display: "flex", alignItems: "center", gap: "18px" }}>{" "}<span style={{ position: "relative", width: "88px", height: "88px", flex: "none" }}>{" "}<span role="img" aria-label="Avatar preview" style={{ width: "88px", height: "88px", borderRadius: "50%", padding: "3px", boxSizing: "border-box", background: "linear-gradient(135deg,#FFFFFF,#5E3AFF)", display: "block" }}><span style={{ width: "100%", height: "100%", borderRadius: "50%", background: $.avatarBg, color: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "28px", fontWeight: "700", border: "3px solid #08070D", boxSizing: "border-box" }}>{$.initials}</span></span>{" "}<button type="button" aria-label="Use a photo instead" style={{ position: "absolute", right: "-4px", bottom: "-4px", width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(255,255,255,.14)", background: "#1D1A2B", color: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6.5" width="18" height="13" rx="2.5"></rect><circle cx="12" cy="13" r="3.5"></circle><path d="M8.5 6.5 10 4h4l1.5 2.5"></path></svg></button>{" "}</span>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>{" "}<span style={{ fontSize: "13px", fontWeight: "500", color: "#A9A6B6" }}>{"Avatar colour"}</span>{" "}<div style={{ display: "flex", gap: "2px", marginLeft: "-5px" }}>{" "}{($.swatches || []).map((sw, i0) => (<Fragment key={i0}>{" "}<button type="button" aria-label={sw?.label} aria-pressed={sw?.on} onClick={sw?.pick} style={{ width: "44px", height: "44px", border: "0", background: "transparent", padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: "30px", height: "30px", borderRadius: "50%", background: sw?.hex, boxShadow: sw?.ring, display: "block" }}></span></button>{" "}</Fragment>))}{" "}</div>{" "}</div>{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{" "}<label htmlFor="ps-user" style={{ fontSize: "13px", fontWeight: "500", color: "#A9A6B6" }}>{"Username"}</label>{" "}<div style={{ display: "flex", alignItems: "center", gap: "4px", height: "56px", boxSizing: "border-box", padding: "0 18px", borderRadius: "18px", border: "1px solid rgba(160,138,255,.55)", background: "rgba(139,109,255,.07)", boxShadow: "0 0 0 4px rgba(139,109,255,.10)" }}><span style={{ fontSize: "16px", color: "#8C8999" }}>{"@"}</span><input id="ps-user" autoComplete="username" value={$.user} onChange={$.onUser} style={{ flex: "1", minWidth: "0", border: "0", background: "transparent", color: "#F7F5F2", fontSize: "16px", outline: "none" }} /></div>{" "}{$.userOk ? (<><span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6EE7B7" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>{"Available"}</span></>) : null}{" "}{$.userShort ? (<><span style={{ fontSize: "13px", color: "#FF8A9A" }}>{"Use 3 to 20 letters, numbers, dots or underscores."}</span></>) : null}{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{" "}<label htmlFor="ps-name" style={{ fontSize: "13px", fontWeight: "500", color: "#A9A6B6" }}>{"Display name "}<span style={{ color: "#8C8999" }}>{"· optional"}</span></label>{" "}<input id="ps-name" autoComplete="name" value={$.name} onChange={$.onName} style={{ height: "56px", boxSizing: "border-box", padding: "0 18px", borderRadius: "18px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", color: "#F7F5F2", fontSize: "16px", outline: "none" }} />{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{" "}<label htmlFor="ps-invite" style={{ fontSize: "13px", fontWeight: "500", color: "#A9A6B6" }}>{"Invite code "}<span style={{ color: "#8C8999" }}>{"· optional"}</span></label>{" "}<input id="ps-invite" value={$.invite} onChange={$.onInvite} placeholder="e.g. KOFI-3M8D" style={{ height: "56px", boxSizing: "border-box", padding: "0 18px", borderRadius: "18px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", color: "#F7F5F2", fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "15px", letterSpacing: ".06em", outline: "none" }} />{" "}<span style={{ fontSize: "12px", lineHeight: "17px", color: "#8C8999" }}>{"Joins Kofi Mensah's circle. Invites earn recognition, not ALKE."}</span>{" "}</div>{" "}</div>{" "}<div style={{ position: "absolute", left: "20px", right: "20px", bottom: "34px", display: "flex", flexDirection: "column", gap: "12px" }}>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "17px", color: "#8C8999", textAlign: "center" }}>{"Your email stays private. Members see only your username, name and avatar."}</p>{" "}<Link to="/rules" style={{ height: "56px", borderRadius: "999px", background: "linear-gradient(135deg,#7A55FA 0%,#6236F5 50%,#5530E8 100%)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600", textDecoration: "none", boxShadow: "0 14px 32px -12px rgba(110,72,255,.85),inset 0 1px 0 rgba(255,255,255,.22)" }}>{"Continue"}</Link>{" "}</div>{" "}</div>{" "}</>);
  }
}
