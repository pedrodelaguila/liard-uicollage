#!/usr/bin/env python3
"""Capturas reproducibles con Chrome local; no necesita paquetes de Python."""
import json, os, re, signal, subprocess, sys, tempfile, time
from pathlib import Path
from urllib.parse import urlencode
root = Path(os.environ.get("LIARD_MOCK_ROOT", Path(__file__).parent)).resolve()
version = sys.argv[1] if len(sys.argv)>1 else "v2"
if not re.fullmatch(r"v[0-9]+", version):
    raise SystemExit("Usar una versión como v2")
chrome = os.environ.get("LIARD_CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
shots = root / "shots" / version
shots.mkdir(parents=True, exist_ok=True)
flags = ["--headless=new", "--hide-scrollbars", "--allow-file-access-from-files", "--virtual-time-budget=15000", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--force-prefers-reduced-motion"]
with tempfile.TemporaryDirectory(prefix="liard-shots-") as profile:
    flags.append("--user-data-dir="+profile)
    def run(args):
        screenshot = next((Path(x.split("=",1)[1]) for x in args if x.startswith("--screenshot=")), None)
        if screenshot and screenshot.exists():
            screenshot.unlink()
        with tempfile.TemporaryFile(mode="w+t") as output, tempfile.TemporaryFile(mode="w+t") as errors:
            process = subprocess.Popen([chrome, *flags, *args], stdout=output, stderr=errors, start_new_session=True)
            try:
                deadline = time.monotonic()+60
                while time.monotonic()<deadline:
                    output.seek(0)
                    dom = output.read()
                    complete = (screenshot is not None and screenshot.exists() and screenshot.stat().st_size>1000) or (screenshot is None and "</html>" in dom and "<title>H=" in dom)
                    if complete:
                        time.sleep(.2)
                        output.seek(0)
                        if screenshot and screenshot.read_bytes()[:8] != b"\x89PNG\r\n\x1a\n":
                            raise RuntimeError("Chrome no generó un PNG válido")
                        return output.read()
                    if process.poll() is not None:
                        errors.seek(0)
                        raise RuntimeError("Chrome terminó sin resultado: "+errors.read()[-2000:])
                    time.sleep(.1)
                raise RuntimeError("Chrome excedió el tiempo sin generar un resultado válido")
            finally:
                # Cerrar únicamente el grupo de procesos creado por esta captura.
                try:
                    os.killpg(process.pid, signal.SIGTERM)
                except ProcessLookupError:
                    pass
                try:
                    process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid, signal.SIGKILL)
                    process.wait()
    def capture(url, name, width=1840, height=1200):
        run([f"--window-size={width},{height}", "--screenshot="+str(shots/name), url])
        print(name, width, height, flush=True)
    capture((root/"index.html").as_uri(), "0-galeria.png")
    for section in json.loads((root/"coverage.json").read_text()):
        url = (root/"index.html").as_uri()+"?"+urlencode({"s":section["id"],"bare":1,"full":1,"measure":1})
        dom = run(["--window-size=1840,1200", "--dump-dom", url])
        match = re.search(r"<title>H=(\d+)</title>", dom)
        if not match:
            raise RuntimeError("No se pudo medir "+section["id"])
        capture(url, section["id"]+".png", height=int(match.group(1)))
    for name, page, section in [("estimate-full", "d-estimate.html", "estimate"),("panel-full", "d-panel.html", "tablero-3d")]:
        url = (root/"index.html").as_uri()+"?"+urlencode({"s":section,"bare":1,"full":1,"measure":1})
        dom = run(["--window-size=1840,1200", "--dump-dom", url])
        match = re.search(r'<iframe[^>]*data-height="(\d+)"', dom)
        if not match:
            raise RuntimeError("No se pudo medir la pantalla "+page)
        capture((root/page).as_uri(), name+".png", width=1440, height=max(994,int(match.group(1))))
