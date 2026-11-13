# Draws the ALKE app icon (gold 3D hexagon) as SVG.
#   python tools/make-icon.py assets gold          -> assets/icon-gold.svg (square, app stores)
#   python tools/make-icon.py public gold round    -> rounded tile, larger emblem (favicon)
# Render the square SVG to a 1024 PNG (assets/app-icon-1024.png) for the stores, then resize.
import math, sys

out = sys.argv[1]
variant = sys.argv[2] if len(sys.argv) > 2 else "purple"
corner = len(sys.argv) > 3 and sys.argv[3] == "round"  # rounded tile, emblem enlarged, no sparkles (favicon)

THEMES = {
    "purple": dict(F=["#E2D8FF", "#9C80FF", "#6440F2", "#4724C8"], I=["#A88EFF", "#6E4BF5", "#4B28D0"], IE="#3B1CB0",
                   MK=["#FFFFFF", "#E9E1FF"], S=["#3A1FA8", "#2A1484", "#23106E", "#311A96"], SH="#1A0A55", HL="#FFFFFF", HLOP=.45, SW=11),
    "gold": dict(F=["#FFF6D6", "#FFD66B", "#F0A92A", "#B86E0C"], I=["#FFE08A", "#F5B83A", "#C47A10"], IE="#8A4E05",
                 MK=["#5B37F0", "#2A1690"], S=["#B0680A", "#8E4F06", "#7A4204", "#9C5B08"], SH="#5A3002", HL="#B9A4FF", HLOP=0, SW=10),
}
T = THEMES[variant]

cx, cy, R, D = 512, 486, 300, 46


def hexpts(r, y=cy, x=cx):
    return " ".join(f"{x + r * math.cos(math.radians(a)):.1f},{y + r * math.sin(math.radians(a)):.1f}" for a in (-90, -30, 30, 90, 150, 210))


def pt(a, r=R, dy=0):
    return (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)) + dy)


sides = ""
for (a1, a2), shade in zip([(-30, 30), (30, 90), (90, 150), (150, 210)], T["S"]):
    p = [pt(a1), pt(a2), pt(a2, dy=D), pt(a1, dy=D)]
    sides += f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in p)}" fill="{shade}" stroke="{shade}" stroke-width="22" stroke-linejoin="round"/>'

MARK = ('<path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z"/><line x1="50" y1="27" x2="50" y2="85"/>'
        '<path d="M20 45 L32 56 L20 67"/><path d="M30 45 L42 56 L30 67"/><path d="M80 45 L68 56 L80 67"/><path d="M70 45 L58 56 L70 67"/>')


def mk(s, sw, col, dx=0, dy=0, op=1):
    return (f'<g transform="translate({cx + dx} {cy + dy}) scale({s}) translate(-50 -56)" fill="none" stroke="{col}" '
            f'stroke-opacity="{op}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{MARK}</g>')


rays = "".join(f'<rect x="497" y="-200" width="30" height="760" fill="url(#ray)" transform="rotate({a} 512 470)"/>' for a in range(0, 360, 30))
star = "M0 -46 C6 -8 8 -6 46 0 C8 6 6 8 0 46 C-6 8 -8 6 -46 0 C-8 -6 -6 -8 0 -46Z"
F, I, MKc = T["F"], T["I"], T["MK"]
SPARKLES = f'<g transform="translate(790 230)"><path d="{star}" fill="#fff" filter="url(#blur3)" opacity=".9"/><path d="{star}" fill="#fff"/></g><circle cx="250" cy="760" r="6" fill="#fff" opacity=".7"/><circle cx="820" cy="700" r="4" fill="#fff" opacity=".6"/><circle cx="190" cy="300" r="4" fill="#fff" opacity=".5"/>'

body = f'''<defs>
 <radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#8A6CFF"/><stop offset=".45" stop-color="#4A27D6"/><stop offset="1" stop-color="#12093A"/></radialGradient>
 <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="face" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="{F[0]}"/><stop offset=".35" stop-color="{F[1]}"/><stop offset=".75" stop-color="{F[2]}"/><stop offset="1" stop-color="{F[3]}"/></linearGradient>
 <linearGradient id="inner" x1=".8" y1="1" x2=".2" y2="0"><stop offset="0" stop-color="{I[0]}"/><stop offset=".55" stop-color="{I[1]}"/><stop offset="1" stop-color="{I[2]}"/></linearGradient>
 <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".5" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="markg" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="700"><stop offset="0" stop-color="{MKc[0]}"/><stop offset="1" stop-color="{MKc[1]}"/></linearGradient>
 <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#B9A4FF" stop-opacity=".75"/><stop offset="1" stop-color="#B9A4FF" stop-opacity="0"/></radialGradient>
 <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
 <filter id="blur8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
 <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
 <clipPath id="faceclip"><polygon points="{hexpts(R)}"/></clipPath>
 <clipPath id="tile"><rect width="1024" height="1024" rx="{230 if corner else 0}"/></clipPath>
</defs>
<g clip-path="url(#tile)">
<rect width="1024" height="1024" fill="url(#bg)"/>
{rays}
<circle cx="512" cy="470" r="420" fill="url(#glow)"/>
<ellipse cx="512" cy="{cy + R + D + 28}" rx="290" ry="46" fill="#05021A" opacity=".55" filter="url(#blur30)"/>
<g transform="{'translate(512 500) scale(1.32) translate(-512 -500)' if corner else ''}">
{sides}
<polygon points="{hexpts(R)}" fill="url(#face)" stroke="url(#face)" stroke-width="22" stroke-linejoin="round"/>
<polygon points="{hexpts(R * 0.84)}" fill="url(#inner)" stroke="{T["IE"]}" stroke-opacity=".35" stroke-width="6" stroke-linejoin="round"/>
<g clip-path="url(#faceclip)"><ellipse cx="420" cy="250" rx="330" ry="170" fill="url(#gloss)" transform="rotate(-18 420 250)"/></g>
<polygon points="{hexpts(R)}" fill="none" stroke="url(#rim)" stroke-width="10" stroke-linejoin="round"/>
<g filter="url(#blur8)" opacity=".55">{mk(3.05, T["SW"], T["SH"], 0, 14)}</g>
{mk(3.05, T["SW"], "url(#markg)")}
{mk(3.05, 3, T["HL"], -2, -3, T["HLOP"])}
</g>
{"" if corner else SPARKLES}
</g>'''

svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">{body}</svg>'
name = f"icon-{variant}{'-round' if corner else ''}"
open(f"{out}/{name}.svg", "w", encoding="utf-8").write(svg)
open(f"{out}/{name}.html", "w", encoding="utf-8").write('<!doctype html><html><body style="margin:0;background:#000">' + svg + "</body></html>")
print(name)
