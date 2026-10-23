#!/usr/bin/env python3
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil, subprocess

ROOT = Path(__file__).resolve().parents[1]
CHECKS = ROOT / "checks"
CHECKS.mkdir(exist_ok=True)
BASE = "http://127.0.0.1:8767/index.html"
TMP = CHECKS / "_tmp_video"
if TMP.exists(): shutil.rmtree(TMP)
TMP.mkdir()

def shot(page, name):
    path = CHECKS / name
    page.screenshot(path=str(path), type="png")
    print("shot", path.name, path.stat().st_size)

def frames_for(page, prefix):
    page.goto(BASE + "?freeze=dark", wait_until="networkidle")
    page.wait_for_timeout(300)
    page.evaluate("() => window.__setPhase('dark')")
    page.wait_for_timeout(400)
    shot(page, f"{prefix}-01-dark.png")
    page.evaluate("() => window.__setPhase('center')")
    page.wait_for_timeout(1000)
    shot(page, f"{prefix}-02-center-lit.png")
    page.evaluate("() => window.__setPhase('title')")
    page.wait_for_timeout(700)
    shot(page, f"{prefix}-03-title.png")
    page.evaluate("() => window.__setPhase('unlocked')")
    page.wait_for_timeout(700)
    shot(page, f"{prefix}-04-unlocked.png")

def record_sequence(browser):
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        device_scale_factor=1,
        record_video_dir=str(TMP),
        record_video_size={"width": 1440, "height": 900},
    )
    page = context.new_page()
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(3800)
    page.evaluate("() => window.__snap(1)")
    page.wait_for_timeout(500)
    page.evaluate("() => window.__snap(1)")
    page.wait_for_timeout(500)
    page.close(); context.close()
    webm = next(TMP.glob("*.webm"))
    mp4 = CHECKS / "aha-sequence-desktop.mp4"
    subprocess.run([
        "ffmpeg","-y","-i",str(webm),
        "-c:v","libx264","-pix_fmt","yuv420p","-movflags","+faststart","-an",str(mp4)
    ], check=True, capture_output=True)
    print("mp4", mp4.name, mp4.stat().st_size)
    shutil.rmtree(TMP)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="chrome", args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    frames_for(page, "desktop"); page.close()
    page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    frames_for(page, "mobile"); page.close()
    record_sequence(browser)
    browser.close()
print("done")
