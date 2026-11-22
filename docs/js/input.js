// Pointer input: drag to pan, pinch / wheel / buttons to zoom, double tap (or click) to reset.
export function bindInput(canvas, office) {
  const pts = new Map();
  let pinchBase = 0, lastTap = 0;
  const dev = (e) => {
    const r = canvas.getBoundingClientRect(), k = office.dpr;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
  };
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, dev(e));
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinchBase = Math.hypot(a.x - b.x, a.y - b.y); }
    const now = performance.now();
    if (pts.size === 1 && now - lastTap < 300) office.resetView();
    if (pts.size === 1) lastTap = now;
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId), cur = dev(e);
    pts.set(e.pointerId, cur);
    if (pts.size === 1) office.panBy(cur.x - prev.x, cur.y - prev.y);
    else if (pts.size === 2) {
      const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchBase && d / pinchBase > 1.25) { office.zoomBy(1, (a.x + b.x) / 2, (a.y + b.y) / 2); pinchBase = d; }
      else if (pinchBase && d / pinchBase < 0.8) { office.zoomBy(-1, (a.x + b.x) / 2, (a.y + b.y) / 2); pinchBase = d; }
    }
  });
  const end = (e) => { pts.delete(e.pointerId); pinchBase = 0; };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  let wheelAt = 0;
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const now = performance.now();
    if (now - wheelAt < 120) return;
    wheelAt = now;
    const p = dev(e);
    office.zoomBy(e.deltaY < 0 ? 1 : -1, p.x, p.y);
  }, { passive: false });
  canvas.addEventListener("dblclick", () => office.resetView());
}
