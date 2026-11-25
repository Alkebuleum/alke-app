import { fmtAlke, toAlke } from "../../lib/genesis";
import { inviteLink } from "../../lib/member";

/* A 1080×1350 share image: name, streak, cALKE (with the ALKE equivalent)
   and the invite link. makeShareCard draws it; ShareSheet (Drill) previews
   it and shares from a fresh tap, because phones refuse the share sheet
   after the async drawing. Real figures only. */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function makeShareCard({ name, streak, balanceC, todayC, nuruId }) {
  const W = 1080;
  const H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }
  const font = (w, s) => `${w} ${s}px Inter, system-ui, sans-serif`;

  // Background
  ctx.fillStyle = "#0A0A0F";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.2, 0, 0, W * 0.2, 0, H * 0.9);
  g.addColorStop(0, "#6A4BF0");
  g.addColorStop(0.35, "#4B2DE0");
  g.addColorStop(0.7, "#2A1690");
  g.addColorStop(1, "#0A0A0F");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // App icon + name
  try {
    const icon = new Image();
    icon.src = "/icon-192.png";
    await icon.decode();
    ctx.save();
    roundRect(ctx, 80, 80, 120, 120, 28);
    ctx.clip();
    ctx.drawImage(icon, 80, 80, 120, 120);
    ctx.restore();
  } catch {
    /* no icon: the name still shows */
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(800, 54);
  ctx.fillText("ALKE", 230, 158);

  // Who + streak
  ctx.font = font(600, 46);
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillText(name || "An Alker", 80, 360);
  if (streak) {
    ctx.font = font(700, 40);
    ctx.fillStyle = "#F5C451";
    ctx.fillText(`🔥 ${streak}-day drilling streak`, 80, 425);
  }

  // The number
  const big = Math.max(balanceC || 0, 0);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(800, big >= 1e8 ? 104 : 120);
  ctx.fillText(fmtAlke(toAlke(big)), 80, 640);
  ctx.font = font(600, 48);
  ctx.fillStyle = "#E4DCFF";
  ctx.fillText("ALKE Rewards · provisional", 80, 715);
  if (todayC > 0) {
    ctx.font = font(600, 40);
    ctx.fillStyle = "#34D399";
    ctx.fillText(`+${fmtAlke(toAlke(todayC))} ALKE drilled today (est.)`, 80, 790);
  }

  // Invite
  roundRect(ctx, 80, 1010, W - 160, 150, 28);
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(700, 40);
  ctx.fillText("Join me on ALKE", 120, 1072);
  ctx.font = font(500, 34);
  ctx.fillStyle = "#B4A2FF";
  ctx.fillText(inviteLink(nuruId).replace("https://", ""), 120, 1124);

  ctx.font = font(400, 26);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillText("ALKE Rewards are provisional: redeemable at mainnet under published rules. Estimates until verified.", 80, 1250);

  const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
  if (!blob) throw new Error("Couldn't draw the card on this device.");
  const link = inviteLink(nuruId);
  return { blob, url: URL.createObjectURL(blob), file: new File([blob], "alke.png", { type: "image/png" }), link, text: `Join me on ALKE: ${link}` };
}

/** Whether this device's share sheet takes image files. */
export const canShareFile = (card) => {
  try {
    return !!(card && navigator.canShare && navigator.canShare({ files: [card.file] }));
  } catch {
    return false;
  }
};

/** Opens the share sheet with the image (call straight from a tap). "cancelled" if the person closed it. */
export async function shareCardFile(card) {
  try {
    await navigator.share({ files: [card.file], title: "ALKE", text: card.text });
    return "shared";
  } catch (e) {
    if (e?.name === "AbortError") return "cancelled";
    throw e;
  }
}
