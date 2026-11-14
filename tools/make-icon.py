# Draws the ALKE app icon ("Solid Hex": a white hexagon with the ALKE mark cut in purple, on violet)
# and renders every size the app needs with headless Edge/Chrome.
#   python tools/make-icon.py
# Writes:
#   assets/app-icon.svg, assets/app-icon-1024.png   square master for the app stores (no transparency)
#   public/favicon.svg                              rounded tile, slightly larger emblem (browser tab, in-app)
#   public/icon-512.png, icon-192.png               Android install / home screen (square; Android masks it)
#   public/apple-touch-icon.png (180)               iPhone home screen (square; iOS rounds it)
#   public/favicon-32.png                           PNG favicon fallback (rounded)
import os, shutil, subprocess, sys, tempfile, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

BG = ("#7556FF", "#2E14A6")   # violet gradient, top-left -> bottom-right
HEX = "#FFFFFF"               # the solid hexagon
CUT = "#4A27D6"               # the mark cut into it

# The mark lives in a 100x112 box: hexagon outline, centre line, one chevron per side.
HEX_PATH = "M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z"
MARK_PATH = "M50 27 L50 85 M24 44 L38 56 L24 68 M76 44 L62 56 L76 68"


def svg(rounded: bool) -> str:
    # Emblem scale: the square master leaves room for Android's maskable safe zone;
    # the rounded favicon fills more of the tile so it reads at 16-32px.
    s = 6.0 if rounded else 5.12
    rx = 230 if rounded else 0
    t = f"translate(512 512) scale({s}) translate(-50 -56)"
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">'
        '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="{BG[0]}"/><stop offset="1" stop-color="{BG[1]}"/></linearGradient></defs>'
        f'<rect width="1024" height="1024" rx="{rx}" fill="url(#bg)"/>'
        f'<path d="{HEX_PATH}" transform="{t}" fill="{HEX}" stroke="{HEX}" stroke-width="6" stroke-linejoin="round"/>'
        f'<path d="{MARK_PATH}" transform="{t}" fill="none" stroke="{CUT}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
        "</svg>"
    )


def browser() -> str:
    for p in (r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Google\Chrome\Application\chrome.exe",
              shutil.which("chromium") or "", shutil.which("google-chrome") or ""):
        if p and os.path.exists(p):
            return p
    sys.exit("Needs Edge or Chrome to render the PNGs.")


def render(svg_text: str, size: int, out: pathlib.Path, transparent: bool):
    with tempfile.TemporaryDirectory() as tmp:
        html = pathlib.Path(tmp, "i.html")
        bg = "transparent" if transparent else "#2E14A6"
        html.write_text(
            f'<!doctype html><html><body style="margin:0;background:{bg};overflow:hidden">'
            + svg_text.replace('width="1024" height="1024"', f'width="{size}" height="{size}" style="display:block"', 1) +
            "</body></html>", encoding="utf-8")
        shot = pathlib.Path(tmp, "s.png")
        args = [browser(), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                f"--user-data-dir={tmp}\\prof", f"--window-size={size},{size}", f"--screenshot={shot}", html.as_uri()]
        if transparent:
            args.insert(2, "--default-background-color=00000000")
        subprocess.run(args, check=True, capture_output=True, timeout=60)
        shutil.copyfile(shot, out)
    print(out.relative_to(ROOT), size)


square, rounded = svg(False), svg(True)
(ROOT / "assets/app-icon.svg").write_text(square, encoding="utf-8")
(ROOT / "public/favicon.svg").write_text(rounded, encoding="utf-8")
render(square, 1024, ROOT / "assets/app-icon-1024.png", False)
render(square, 512, ROOT / "public/icon-512.png", False)
render(square, 192, ROOT / "public/icon-192.png", False)
render(square, 180, ROOT / "public/apple-touch-icon.png", False)
render(rounded, 32, ROOT / "public/favicon-32.png", True)
