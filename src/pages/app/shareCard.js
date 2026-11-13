import { approxAlke, fmtC } from "../../lib/genesis";
import { inviteLink } from "../../lib/member";

/* A 1080×1350 share image: name, streak, cALKE (with the ALKE equivalent)
   and the invite link. Shared through the phone's share sheet when it can
   take files, else downloaded. Real figures only. */

const MARK = [
  "M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z",
  "M50 27 L50 85",
  "M20 45 L32 56 L20 67",
  "M30 45 L42 56 L30 67",
  "M80 45 L68 56 L80 67",
  "M70 45 L58 56 L70 67",
];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function shareCard({ name, streak, balanceC, todayC, nuruId }) {
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

  // Logo tile + wordmark
  const tile = ctx.createLinearGradient(80, 80, 200, 200);
  tile.addColorStop(0, "#8A6CFF");
  tile.addColorStop(1, "#6243F0");
  ctx.fillStyle = tile;
  roundRect(ctx, 80, 80, 120, 120, 32);
  ctx.fill();
  ctx.save();
  ctx.translate(110, 106);
  ctx.scale(0.6, 0.6);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  MARK.forEach((d) => ctx.stroke(new Path2D(d)));
  ctx.restore();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(800, 54);
  ctx.fillText("ALKÉ Network", 230, 158);

  // Who + streak
  ctx.font = font(600, 46);
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillText(name || "An Alker", 80, 360);
  if (streak) {
    ctx.font = font(700, 40);
    ctx.fillStyle = "#F5C451";
    ctx.fillText(`🔥 ${streak}-day mining streak`, 80, 425);
  }

  // The number
  const big = Math.max(balanceC || 0, 0);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(800, big >= 1e8 ? 110 : 132);
  ctx.fillText(fmtC(big), 80, 640);
  ctx.font = font(600, 48);
  ctx.fillStyle = "#E4DCFF";
  ctx.fillText(`cALKE · ${approxAlke(big)}`, 80, 715);
  if (todayC > 0) {
    ctx.font = font(600, 40);
    ctx.fillStyle = "#34D399";
    ctx.fillText(`+${fmtC(todayC)} mining today (est.)`, 80, 790);
  }

  // Invite
  roundRect(ctx, 80, 1010, W - 160, 150, 28);
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(700, 40);
  ctx.fillText("Join me on ALKÉ Network", 120, 1072);
  ctx.font = font(500, 34);
  ctx.fillStyle = "#B4A2FF";
  ctx.fillText(inviteLink(nuruId).replace("https://", ""), 120, 1124);

  ctx.font = font(400, 26);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillText("cALKE is cold ALKE: locked until warmed and released. Estimates until verified.", 80, 1250);

  const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], "alke-network.png", { type: "image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "ALKÉ Network", text: `Join me on ALKÉ Network: ${inviteLink(nuruId)}` });
      return;
    }
  } catch {
    return; // cancelled
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "alke-network.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
