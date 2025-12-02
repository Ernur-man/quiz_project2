import { useEffect, useRef } from "react";
import "./cursor.less";

export default function CursorTrailStyled() {
  const poolRef = useRef([]);
  const lastPos = useRef({ x: null, y: null, time: 0 });

  const CONFIG = {
    maxPool: 120,
    life: 500,
    density: 10,

    // уменьшенные размеры 👇
    baseWidth: 6,     // толщина
    baseLength: 8,    // длина
    speedLenFactor: 0.05, // слабое увеличение от скорости

    // новые цвета 💜
    colorStart: "#d8b4fe", // светло-фиолетовый
    colorEnd: "#a5f3fc",   // голубой

    glow: true
  };

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    if (isTouch) return;

    // создаём сегмент
    const createDom = () => {
      const el = document.createElement("div");
      el.className = "cursor-seg styled";
      el.style.opacity = "0";
      document.body.appendChild(el);
      return el;
    };

    for (let i = 0; i < CONFIG.maxPool; i++) {
      poolRef.current.push({ el: createDom(), busy: false, timeout: null });
    }

    const getFree = () => {
      const p = poolRef.current;
      for (let i = 0; i < p.length; i++) if (!p[i].busy) return p[i];
      return p[0];
    };

    const placeSegment = (x, y, vx, vy) => {
      const seg = getFree();
      seg.busy = true;
      const el = seg.el;

      const speed = Math.hypot(vx, vy);
      const len = Math.max(4, CONFIG.baseLength + speed * CONFIG.speedLenFactor);
      const thickness = Math.max(3, CONFIG.baseWidth);

      // круглая форма → радиус 999px
      el.style.width = `${len}px`;
      el.style.height = `${len}px`;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `translate(-50%, -50%)`;
      el.style.opacity = "1";

      // градиент + glow
      el.style.background = `radial-gradient(circle, ${CONFIG.colorStart}, ${CONFIG.colorEnd})`;
      el.style.boxShadow = CONFIG.glow ? `0 0 12px ${CONFIG.colorEnd}` : "none";
      el.style.transition = `opacity 0.4s ease-out`;

      clearTimeout(seg.timeout);

      seg.timeout = setTimeout(() => {
        el.style.opacity = "0";
        setTimeout(() => (seg.busy = false), 400);
      }, CONFIG.life);
    };

    const handleMove = (e) => {
      const now = performance.now();
      const lp = lastPos.current;

      if (lp.x === null) {
        lastPos.current = { x: e.clientX, y: e.clientY, time: now };
        return;
      }

      const dx = e.clientX - lp.x;
      const dy = e.clientY - lp.y;
      const dist = Math.hypot(dx, dy);

      if (dist > CONFIG.density) {
        const dt = now - lp.time || 1;
        const vx = (dx / dt) * 16.67;
        const vy = (dy / dt) * 16.67;

        placeSegment(e.clientX, e.clientY, vx, vy);

        lastPos.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      poolRef.current.forEach(p => {
        clearTimeout(p.timeout);
        p.el.remove();
      });
      poolRef.current = [];
    };
  }, []);

  return null;
}
