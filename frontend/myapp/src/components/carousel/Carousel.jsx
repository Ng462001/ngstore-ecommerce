import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

/* ---------------------------------------------------------------- constants */

const RADIUS = 1; // Fixed ring radius
const SEG = 28; // Facets per panel for smooth 3D arc
const FOV = 50; // Vertical field of view in degrees
const DPR_CAP = 2;
const TEX_CAP = 2048;
const SPIN_AT_50 = 0.14; // rad/sec
const MOVE_DT_FLOOR = 4; // ms
const MAX_FLICK = 12; // rad/sec
const DIST_MAX = 0.9;
const GRAZE_DIM = 0.42;
const AA_FALLBACK = 0.004;

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80",
    title: "Vibrant Summer",
    subtitle: "New Couture Season",
  },
  {
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80",
    title: "High Fashion",
    subtitle: "Modern Luxury Essentials",
  },
  {
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80",
    title: "Urban Aesthetics",
    subtitle: "Minimalist Trends",
  },
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80",
    title: "Autumn Elegance",
    subtitle: "Exclusive Runway Collection",
  },
  {
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&auto=format&fit=crop&q=80",
    title: "Streetwear Culture",
    subtitle: "Signature Styles",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80",
    title: "Timeless Classics",
    subtitle: "Heritage Tailoring",
  },
  {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1000&auto=format&fit=crop&q=80",
    title: "Chic Outerwear",
    subtitle: "Refined Silhouettes",
  },
  {
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1000&auto=format&fit=crop&q=80",
    title: "Statement Accents",
    subtitle: "Handcrafted Luxury",
  },
];

/* ------------------------------------------------------------------ shaders */

const VERT = `
precision highp float;

attribute vec2 aCell;   // (s across panel arc 0..1, v down panel 0..1)

uniform float uArc0;    // where this panel starts, radians
uniform float uSpan;    // how much of the ring it covers, radians
uniform float uYaw;
uniform float uHeight;  // panel height, world units
uniform float uPitch;
uniform float uDist;    // camera offset along +z, world units, always < RADIUS
uniform float uRadius;
uniform float uFocal;   // in NDC units: 1 / tan(fov / 2)
uniform float uAspect;

varying vec2  vUv;
varying float vFace;

void main() {
    float th = uArc0 + aCell.x * uSpan + uYaw;
    vec3 p = vec3(uRadius * sin(th), (0.5 - aCell.y) * uHeight, uRadius * cos(th));

    vec3 rel = p - vec3(0.0, 0.0, uDist);
    float c = cos(uPitch);
    float s = sin(uPitch);
    vec3 q = vec3(rel.x, rel.y * c - rel.z * s, rel.y * s + rel.z * c);

    float w = -q.z;
    gl_Position = vec4(q.x * uFocal / uAspect, q.y * uFocal, 0.0, w);

    vUv = vec2(1.0 - aCell.x, aCell.y);

    vec3 n = -vec3(sin(th), 0.0, cos(th));
    vec3 toCam = normalize(vec3(0.0, 0.0, uDist) - p);
    vFace = clamp(dot(n, toCam), 0.0, 1.0);
}
`;

const FRAG = (deriv) =>
  `${deriv ? "#extension GL_OES_standard_derivatives : enable\n" : ""}precision highp float;

${deriv ? "#define AAW(x) fwidth(x)" : `#define AAW(x) ${AA_FALLBACK.toFixed(4)}`}

uniform sampler2D uTex;
uniform float uHas;         // 1 = a picture is loaded, 0 = placeholder
uniform vec3  uTint;        // placeholder colour, one hue per slot
uniform float uTexAspect;   // the picture's own w/h
uniform float uPanelAspect; // the panel's world w/h
uniform float uRound;       // 0..1, fraction of half the panel's short side
uniform float uGraze;

varying vec2  vUv;
varying float vFace;

void main() {
    vec2 uv = vUv - 0.5;
    float ra = uTexAspect / uPanelAspect;
    if (ra > 1.0) uv.x /= ra; else uv.y *= ra;
    uv += 0.5;

    vec3 pic = texture2D(uTex, uv).rgb;
    vec3 hold = uTint * (1.0 - 0.28 * vUv.y);
    vec3 rgb = mix(hold, pic, uHas);

    vec2 hs = vec2(uPanelAspect, 1.0) * 0.5;
    vec2 pp = (vUv - 0.5) * vec2(uPanelAspect, 1.0);
    float r = uRound * min(hs.x, hs.y);
    vec2 d = abs(pp) - hs + r;
    float sd = min(max(d.x, d.y), 0.0) + length(max(d, vec2(0.0))) - r;
    float w = max(AAW(sd), 1e-5);
    float a = 1.0 - smoothstep(-w, w, sd);

    float shade = mix(uGraze, 1.0, vFace);
    gl_FragColor = vec4(rgb * shade * a, a);
}
`;

/* ------------------------------------------------------------------ helpers */

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("RotundaCarousel shader:", gl.getShaderInfoLog(sh));
  }
  return sh;
}

function potFit(n, cap) {
  let p = 64;
  while (p * 2 <= Math.min(n, cap)) p *= 2;
  const up = Math.min(p * 2, cap);
  return Math.abs(up - n) < Math.abs(n - p) ? up : p;
}

function slotTint(i, n) {
  const h = ((i / Math.max(1, n)) * 360 + 210) % 360;
  const s = 0.3;
  const l = 0.42;
  const k = (m) => (m + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (m) =>
    l - a * Math.max(-1, Math.min(Math.min(k(m) - 3, 9 - k(m)), 1));
  return [f(0), f(8), f(4)];
}

function wrapPi(x) {
  const t = Math.PI * 2;
  return ((((x + Math.PI) % t) + t) % t) - Math.PI;
}

/* ----------------------------------------------------------------- component */

export const RotundaCarousel = ({
  images = DEFAULT_ITEMS,
  background = "radial-gradient(circle at 50% 50%, rgba(245, 233, 215, 0.9) 0%, rgba(225, 197, 155, 0.65) 45%, rgba(184, 146, 90, 0.35) 75%, rgba(250, 249, 246, 1) 100%)",
  gap = 40,
  panelWidth = 640,
  panelHeight = 450,
  rounded = 18,
  distance = 78,
  tilt = 0,
  speed = 45,
  cursor = { hover: 80, damping: 60 },
  className = "",
  style = {},
  showControls = true,
  showOverlay = true,
}) => {
  const navigate = useNavigate();
  const { damping = 60, hover = 80 } = cursor;

  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isWebGlSupported, setIsWebGlSupported] = useState(true);
  const impulseRef = useRef(null);

  const srcKey = JSON.stringify(
    (Array.isArray(images) ? images : []).map((i) => i?.image ?? ""),
  );

  const live = useRef({
    images,
    srcKey,
    gap,
    panelWidth,
    panelHeight,
    rounded,
    distance,
    tilt,
    speed: isPlaying ? speed : 0,
    damping,
    hover,
  });

  live.current = {
    images,
    srcKey,
    gap,
    panelWidth,
    panelHeight,
    rounded,
    distance,
    tilt,
    speed: isPlaying ? speed : 0,
    damping,
    hover,
  };

  const drag = useRef({
    down: 0,
    over: 0,
    grab: 0,
    vel: 0,
    lastT: 0,
    hoverAmt: 0,
  });

  // Smooth impulse function for arrow buttons
  const applyImpulse = useCallback((direction) => {
    drag.current.vel += direction * 2.8;
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let gl = null;
    try {
      gl =
        canvas.getContext("webgl", {
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
          depth: false,
        }) ||
        canvas.getContext("experimental-webgl", {
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
          depth: false,
        });
    } catch {
      gl = null;
    }

    if (!gl) {
      setIsWebGlSupported(false);
      return;
    }

    const deriv = !!gl.getExtension("OES_standard_derivatives");

    /* ---- program ---- */
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG(deriv));
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      setIsWebGlSupported(false);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("RotundaCarousel link:", gl.getProgramInfoLog(prog));
      setIsWebGlSupported(false);
      return;
    }
    gl.useProgram(prog);

    const aCell = gl.getAttribLocation(prog, "aCell");
    const U = (n) => gl.getUniformLocation(prog, n);
    const u = {
      arc0: U("uArc0"),
      span: U("uSpan"),
      yaw: U("uYaw"),
      height: U("uHeight"),
      pitch: U("uPitch"),
      dist: U("uDist"),
      radius: U("uRadius"),
      focal: U("uFocal"),
      aspect: U("uAspect"),
      tex: U("uTex"),
      has: U("uHas"),
      tint: U("uTint"),
      texAspect: U("uTexAspect"),
      panelAspect: U("uPanelAspect"),
      round: U("uRound"),
      graze: U("uGraze"),
    };

    /* ---- unit panel vertices ---- */
    const verts = new Float32Array((SEG + 1) * 4);
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;
      verts[i * 4] = t;
      verts[i * 4 + 1] = 0;
      verts[i * 4 + 2] = t;
      verts[i * 4 + 3] = 1;
    }
    const cellBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const vertCount = (SEG + 1) * 2;

    /* ---- textures ---- */
    const maxTex = Math.max(
      256,
      Math.min(TEX_CAP, gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048),
    );
    const anisoExt =
      gl.getExtension("EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
      gl.getExtension("MOZ_EXT_texture_filter_anisotropic");

    const aniso = anisoExt
      ? {
          pname: anisoExt.TEXTURE_MAX_ANISOTROPY_EXT,
          max: Math.min(
            8,
            gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4,
          ),
        }
      : null;

    const blank = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, blank);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([28, 27, 25, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const cache = new Map();
    const pending = new Set();

    const ensure = (src) => {
      if (!src || cache.has(src) || pending.has(src)) return;
      pending.add(src);
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onerror = () => {
        pending.delete(src);
      };
      im.onload = () => {
        pending.delete(src);
        if (!im.naturalWidth || !im.naturalHeight) return;
        const w = potFit(im.naturalWidth, maxTex);
        const h = potFit(im.naturalHeight, maxTex);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const cx = c.getContext("2d");
        if (!cx) return;
        cx.drawImage(im, 0, 0, w, h);
        const t = gl.createTexture();
        if (!t) return;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR_MIPMAP_LINEAR,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.pname, aniso.max);
        cache.set(src, {
          tex: t,
          aspect: im.naturalWidth / im.naturalHeight,
        });
      };
      im.src = src;
    };

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let cssW = 0;
    let cssH = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cssW = host.clientWidth || canvas.clientWidth || 0;
      cssH = host.clientHeight || canvas.clientHeight || 0;
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const view = { focal: 1, aspect: 1, dist: 0, pitch: 0 };
    let yaw = 0;

    const screenTheta = (ox, oy) => {
      const w = host.offsetWidth || 1;
      const h = host.offsetHeight || 1;
      const nx = (ox / w) * 2 - 1;
      const ny = 1 - (oy / h) * 2;

      const dx = (nx * view.aspect) / view.focal;
      const dy = ny / view.focal;
      const dz = -1;

      const c = Math.cos(view.pitch);
      const s = Math.sin(view.pitch);
      const wz = -dy * s + dz * c;

      const a = dx * dx + wz * wz;
      const b = 2 * view.dist * wz;
      const cc = view.dist * view.dist - RADIUS * RADIUS;
      if (a <= 1e-9) return null;
      const disc = b * b - 4 * a * cc;
      if (disc < 0) return null;
      const t = (-b + Math.sqrt(disc)) / (2 * a);
      if (!(t > 0)) return null;
      return Math.atan2(t * dx, view.dist + t * wz);
    };

    const onDown = (e) => {
      const rect = host.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      const th = screenTheta(ox, oy);
      if (th == null) return;
      const d = drag.current;
      d.down = 1;
      d.vel = 0;
      d.lastT = e.timeStamp;
      d.grab = th - yaw;
      host.style.cursor = "grabbing";
      try {
        host.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onMove = (e) => {
      const d = drag.current;
      d.over = 1;
      if (!d.down) return;
      const rect = host.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      const th = screenTheta(ox, oy);
      if (th == null) return;
      const delta = wrapPi(th - d.grab - yaw);
      yaw += delta;
      const dt = Math.max(MOVE_DT_FLOOR, e.timeStamp - d.lastT) / 1000;
      d.lastT = e.timeStamp;
      const v = d.vel * 0.4 + (delta / dt) * 0.6;
      d.vel = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, v));
    };

    const onUp = () => {
      drag.current.down = 0;
      if (host) host.style.cursor = "grab";
    };

    const onEnter = () => {
      drag.current.over = 1;
    };

    const onLeave = () => {
      drag.current.over = 0;
      drag.current.down = 0;
      if (host) host.style.cursor = "grab";
    };

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointercancel", onUp);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (cssW <= 0 || cssH <= 0) {
        resize();
        if (cssW <= 0 || cssH <= 0) return;
      }

      const L = live.current;
      const list =
        Array.isArray(L.images) && L.images.length ? L.images : DEFAULT_ITEMS;
      const n = list.length;

      const d = drag.current;
      const target = d.over ? 1 : 0;
      d.hoverAmt += (target - d.hoverAmt) * Math.min(1, dt * 6);

      if (!d.down) {
        yaw += d.vel * dt;
        d.vel *= Math.exp(-dt * (0.5 + (L.damping / 100) * 7));
        const slow = 1 - (L.hover / 100) * d.hoverAmt;
        yaw += (L.speed / 50) * SPIN_AT_50 * slow * dt;
      }
      yaw = yaw % (Math.PI * 2);

      // Adaptive panel proportions based on container width
      const isMobileScreen = cssW < 640;
      const activeGap = isMobileScreen ? Math.max(16, L.gap * 0.5) : L.gap;
      const activePanelWidth = isMobileScreen
        ? Math.min(cssW * 0.82, 380)
        : L.panelWidth;
      const activePanelHeight = isMobileScreen
        ? Math.min(cssH * 0.72, 360)
        : L.panelHeight;
      const activeDistance = isMobileScreen
        ? Math.min(84, L.distance + 4)
        : L.distance;

      const itemArc = (Math.PI * 2) / n;
      const pw = Math.max(1, activePanelWidth);
      const ph = Math.max(1, activePanelHeight);
      const circum = Math.max(1, n * (pw + Math.max(0, activeGap)));
      const span = Math.min(itemArc, (Math.PI * 2 * pw) / circum);
      const worldW = RADIUS * span;
      const worldH = Math.max(1e-4, (Math.PI * 2 * ph) / circum);
      const panelAspect = worldW / worldH;

      const vAspect = Math.max(0.05, cssW / Math.max(1, cssH));
      const focal = 1 / Math.tan(((FOV / 2) * Math.PI) / 180);
      const dist = Math.max(
        0,
        Math.min(DIST_MAX, activeDistance / 100) * RADIUS,
      );
      const pitch = (L.tilt * Math.PI) / 180;

      view.focal = focal;
      view.aspect = vAspect;
      view.dist = dist;
      view.pitch = pitch;

      gl.useProgram(prog);
      gl.uniform1f(u.yaw, yaw);
      gl.uniform1f(u.height, worldH);
      gl.uniform1f(u.pitch, pitch);
      gl.uniform1f(u.dist, dist);
      gl.uniform1f(u.radius, RADIUS);
      gl.uniform1f(u.focal, focal);
      gl.uniform1f(u.aspect, vAspect);
      gl.uniform1f(u.span, span);
      gl.uniform1f(u.panelAspect, panelAspect);
      gl.uniform1f(u.round, Math.max(0, Math.min(100, L.rounded)) / 100);
      gl.uniform1f(u.graze, GRAZE_DIM);
      gl.uniform1i(u.tex, 0);
      gl.activeTexture(gl.TEXTURE0);

      gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);
      gl.enableVertexAttribArray(aCell);
      gl.vertexAttribPointer(aCell, 2, gl.FLOAT, false, 0, 0);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      for (let i = 0; i < n; i++) {
        const src = list[i]?.image ?? "";
        if (src) ensure(src);
        const hit = src ? cache.get(src) : undefined;
        gl.uniform1f(u.arc0, i * itemArc + (itemArc - span) * 0.5);
        if (hit) {
          gl.bindTexture(gl.TEXTURE_2D, hit.tex);
          gl.uniform1f(u.has, 1);
          gl.uniform1f(u.texAspect, hit.aspect);
          gl.uniform3f(u.tint, 0, 0, 0);
        } else {
          gl.bindTexture(gl.TEXTURE_2D, blank);
          gl.uniform1f(u.has, 0);
          gl.uniform1f(u.texAspect, panelAspect);
          const t = slotTint(i, n);
          gl.uniform3f(u.tint, t[0], t[1], t[2]);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertCount);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointerup", onUp);
      cache.forEach((v) => gl.deleteTexture(v.tex));
      cache.clear();
      gl.deleteTexture(blank);
      gl.deleteBuffer(cellBuf);
    };
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden select-none group rounded-3xl shadow-[0_12px_40px_-10px_rgba(28,27,25,0.08)] border border-[#E7E4DD] ${className}`}
      style={{
        background,
        height: "clamp(420px, 85vh, 820px)",
        minHeight: "380px",
        ...style,
      }}
    >
      {/* 3D WebGL Host */}
      <div
        ref={hostRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "pan-y",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>

      {/* Luxury Ambient Lighting Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(184,146,90,0.12),transparent_65%)]" />
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-[#FAF9F6]/80 via-[#FAF9F6]/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/85 to-transparent" />

      {/* Top Badge & Header Overlay */}
      {showOverlay && (
        <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-8 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E7E4DD] text-[#1C1B19] text-xs sm:text-sm font-medium tracking-wide shadow-sm">
            <AutoAwesomeIcon sx={{ fontSize: 16, color: "#B8925A" }} />
            <span>Shop New Collection</span>
          </div>
        </div>
      )}

      {/* Bottom Information & CTA Bar */}
      {showOverlay && (
        <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 z-10">
          <div className="text-left pointer-events-auto">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B8925A] font-semibold block mb-1">
              New Collection
            </span>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-[#1C1B19] tracking-tight drop-shadow-sm">
              Explore the Latest Trends
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6862] max-w-sm sm:max-w-md line-clamp-1 mt-0.5">
              Discover masterfully crafted garments and trending accessories.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => navigate("/store")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#B8925A] to-[#9E7B47] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border border-[#D4AF37]/30 cursor-pointer"
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />
              <span>Shop Collection</span>
            </button>
          </div>
        </div>
      )}

      {/* Left / Right Interactive Impulse Navigation Buttons & Play/Pause */}
      {showControls && (
        <>
          <button
            onClick={() => applyImpulse(1)}
            aria-label="Rotate Left"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-[#B8925A] text-[#1C1B19] hover:text-white backdrop-blur-md border border-[#E7E4DD] hover:border-[#B8925A] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-md opacity-80 sm:opacity-0 group-hover:opacity-100"
          >
            <ArrowBackIosNewIcon
              sx={{ fontSize: { xs: 14, sm: 18 }, ml: "-2px" }}
            />
          </button>

          <button
            onClick={() => applyImpulse(-1)}
            aria-label="Rotate Right"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-[#B8925A] text-[#1C1B19] hover:text-white backdrop-blur-md border border-[#E7E4DD] hover:border-[#B8925A] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-md opacity-80 sm:opacity-0 group-hover:opacity-100"
          >
            <ArrowForwardIosIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
          </button>

          {/* Pause / Play Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause rotation" : "Play rotation"}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1C1B19] backdrop-blur-md border border-[#E7E4DD] flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            {isPlaying ? (
              <PauseIcon sx={{ fontSize: 16 }} />
            ) : (
              <PlayArrowIcon sx={{ fontSize: 16 }} />
            )}
          </button>
        </>
      )}

      {/* Fallback in case WebGL is disabled or unsupported */}
      {!isWebGlSupported && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#FAF9F6] text-[#1C1B19] text-center">
          <div className="max-w-md">
            <h3 className="text-lg font-bold mb-2">3D View Unavailable</h3>
            <p className="text-sm text-[#6B6862] mb-4">
              Enable hardware acceleration in your browser settings to view the
              interactive 3D rotunda.
            </p>
            <button
              onClick={() => navigate("/store")}
              className="px-4 py-2 bg-[#B8925A] text-white rounded-lg font-medium shadow"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RotundaCarousel;
