/* =========================
   IMPORTS & VARIABLES
========================= */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #080808;
  --surface: #101010;
  --surface2: #161616;
  --surface3: #1e1e1e;
  --border: rgba(255,255,255,0.07);
  --border-hover: rgba(255,255,255,0.15);
  --text: #f0ede8;
  --text-muted: #6b6762;
  --text-soft: #a09b95;
  --accent: #e8c97a;
  --accent-dim: rgba(232, 201, 122, 0.12);
  --accent-glow: rgba(232, 201, 122, 0.25);
  --red: #e05c5c;
  --radius: 10px;
  --radius-lg: 16px;
  --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

/* =========================
   GLOBAL RESET
========================= */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html { scroll-behavior: smooth; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  background-image:
    radial-gradient(ellipse 80% 40% at 50% -10%, rgba(232,201,122,0.05) 0%, transparent 70%);
}

/* =========================
   AUTH PAGE
========================= */
.auth-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle 600px at 50% 50%, rgba(232,201,122,0.04), transparent),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 39px,
      rgba(255,255,255,0.015) 39px,
      rgba(255,255,255,0.015) 40px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 39px,
      rgba(255,255,255,0.015) 39px,
      rgba(255,255,255,0.015) 40px
    );
  pointer-events: none;
}

.auth-container h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3.8rem;
  letter-spacing: 0.12em;
  color: var(--text);
  margin-bottom: 8px;
  position: relative;
}

.auth-container h1::after {
  content: '';
  display: block;
  width: 40px;
  height: 2px;
  background: var(--accent);
  margin: 8px auto 0;
}

.auth-container input {
  width: 300px;
  padding: 14px 18px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.auth-container input::placeholder { color: var(--text-muted); }

.auth-container input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

.auth-container button {
  width: 300px;
  padding: 14px;
  background: var(--surface3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition), transform var(--transition);
}

.auth-container button:first-of-type {
  background: var(--accent);
  border-color: var(--accent);
  color: #1a1200;
}

.auth-container button:first-of-type:hover {
  background: #f0d68a;
  transform: translateY(-1px);
}

.auth-container button:last-of-type:hover {
  background: var(--surface3);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.auth-container p {
  color: var(--red);
  font-size: 0.88rem;
  font-weight: 500;
  height: 20px;
  font-family: 'JetBrains Mono', monospace;
}

/* =========================
   DASHBOARD CONTAINER
========================= */
.container {
  padding: 0 28px 60px;
  max-width: 1280px;
  margin: 0 auto;
}

/* =========================
   HEADER
========================= */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 36px 0 28px;
  position: relative;
}

.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}

.dashboard-header h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.8rem;
  letter-spacing: 0.14em;
  color: var(--text);
  margin: 0;
}

.dashboard-logo {
  width: 52px;
  height: 52px;
  object-fit: contain;
  filter: drop-shadow(0 0 12px var(--accent-glow));
}

/* =========================
   TABS
========================= */
.tabs {
  display: flex;
  gap: 6px;
  margin: 24px 0 20px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}

.tab-btn {
  background: transparent;
  color: var(--text-muted);
  border: none;
  border-bottom: 2px solid transparent;
  padding: 10px 18px 12px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: color var(--transition), border-color var(--transition);
  margin-bottom: -1px;
}

.tab-btn:hover { color: var(--text-soft); }

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* =========================
   NEW VIDEOS BANNER
========================= */
.new-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--accent-dim);
  border: 1px solid rgba(232, 201, 122, 0.2);
  padding: 12px 18px;
  border-radius: var(--radius);
  margin-bottom: 20px;
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  animation: slideDown 0.3s ease;
}

.new-banner button {
  background: var(--accent);
  border: none;
  padding: 7px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.82rem;
  color: #1a1200;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background var(--transition);
}

.new-banner button:hover { background: #f0d68a; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* =========================
   VIDEO GRID / CARDS
========================= */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: visible;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
  position: relative;
}

/* clip only the top media, not the whole card */
.card > img,
.cvp-wrapper,
.cvp-thumb-wrap {
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--border-hover);
  box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,201,122,0.06);
}

.card > img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  display: block;
}

.card p {
  padding: 12px 14px 4px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.4;
}

.card a,
.card button {
  display: block;
  margin: 4px 14px;
  background: var(--surface3);
  color: var(--text-soft);
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 7px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  font-family: 'DM Sans', sans-serif;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}

.card a:last-child,
.card button:last-child { margin-bottom: 12px; }

.card a:hover,
.card button:hover {
  background: var(--surface2);
  color: var(--text);
  border-color: var(--border-hover);
}

.card button[onclick]:hover {
  background: rgba(224, 93, 93, 0.1);
  border-color: rgba(224, 93, 93, 0.35);
  color: #f09090;
}

/* =========================
   UPLOAD CARD
========================= */
.upload-card {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 32px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  max-width: 540px;
  position: relative;
  padding-bottom: 52px;
}

.upload-card .input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 6px;
}

.upload-card .input-group label {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.upload-card .input-group input[type="text"] {
  padding: 13px 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
  width: 100%;
}

.upload-card .input-group input[type="text"]::placeholder { color: var(--text-muted); }

.upload-card .input-group input[type="text"]:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

.upload-card button {
  background: var(--surface3);
  border: 1px solid var(--border);
  padding: 11px 20px;
  border-radius: var(--radius);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition), transform var(--transition);
}

.upload-card button:hover {
  background: var(--surface2);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.upload-card button#uploadBtn {
  background: var(--accent);
  border-color: var(--accent);
  color: #1a1200;
  font-weight: 700;
  padding: 13px 28px;
  width: 100%;
}

.upload-card button#uploadBtn:hover {
  background: #f0d68a;
  border-color: #f0d68a;
  transform: translateY(-1px);
}

#fileName, #thumbnailFileName {
  color: var(--text-muted);
  font-size: 0.82rem;
  font-family: 'JetBrains Mono', monospace;
}

#uploadMessage {
  color: var(--text-soft);
  font-size: 0.88rem;
  font-family: 'JetBrains Mono', monospace;
  min-height: 20px;
}

.upload-card h5 {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
}

#uploadBarContainer {
  width: 100%;
  background: var(--surface3);
  border-radius: 100px;
  overflow: hidden;
  height: 4px;
}

#uploadBar {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #f5e0a0);
  transition: width 0.3s ease;
  border-radius: 100px;
}

/* =========================
   PROFILE CARD
========================= */
.profile-card {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 32px;
  border-radius: var(--radius-lg);
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-card p {
  color: var(--text-muted);
  font-size: 0.82rem;
  font-family: 'JetBrains Mono', monospace;
}

.profile-card p span { color: var(--accent); }

.profile-card input[type="text"],
.profile-card input[type="file"] {
  padding: 12px 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
  width: 100%;
}

.profile-card input[type="file"] {
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.82rem;
  padding: 10px 14px;
}

.profile-card input[type="text"]:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

.profile-card button {
  padding: 13px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius);
  color: #1a1200;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background var(--transition), transform var(--transition);
}

.profile-card button:hover {
  background: #f0d68a;
  transform: translateY(-1px);
}

.profile-card img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
  align-self: center;
  box-shadow: 0 0 0 4px var(--accent-dim);
}

#profileMessage {
  color: var(--text-soft);
  font-size: 0.82rem;
  font-family: 'JetBrains Mono', monospace;
  text-align: center;
}

/* =========================
   BADGES TAB
========================= */
#badgesTab h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 0.1em;
  color: var(--text-soft);
  margin-bottom: 20px;
}

#badgesList {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.badge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 130px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 10px 14px;
  gap: 8px;
  text-align: center;
  transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);
}

.badge-card:not([style*="opacity: 0.4"]):hover {
  border-color: rgba(232, 201, 122, 0.35);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px var(--accent-dim);
}

.badge-card img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 8px;
}

.badge-card .badge-title {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text);
  letter-spacing: 0.04em;
}

.badge-card .badge-subtitle {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.4;
}

/* =========================
   SCROLLBAR
========================= */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 100px; }
::-webkit-scrollbar-thumb:hover { background: #2e2e2e; }

::selection { background: var(--accent-dim); color: var(--accent); }

/* =========================
   CUSTOM VIDEO PLAYER
========================= */
.cvp-wrapper {
  position: relative;
  background: #000;
  display: block;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: visible;
  cursor: pointer;
  outline: none;
}

/* When the browser puts us in fullscreen, fill the screen */
.cvp-wrapper:fullscreen,
.cvp-wrapper:-webkit-full-screen,
.cvp-wrapper:-moz-full-screen {
  width: 100vw;
  height: 100vh;
  aspect-ratio: unset;
  overflow: hidden;
}

.cvp-wrapper:fullscreen .cvp-video,
.cvp-wrapper:-webkit-full-screen .cvp-video,
.cvp-wrapper:-moz-full-screen .cvp-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cvp-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.cvp-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background 0.2s;
  pointer-events: none;
  z-index: 2;
}

.cvp-overlay--dim {
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
}

.cvp-big-play {
  width: 64px;
  height: 64px;
  background: var(--accent);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  pointer-events: all;
  box-shadow: 0 0 24px var(--accent-glow);
}

.cvp-big-play svg {
  width: 24px;
  height: 24px;
  color: #1a1200;
  margin-left: 3px;
}

.cvp-big-play:hover { transform: scale(1.1); }

.cvp-controls {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 10px 14px 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 3;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.22s ease, transform 0.22s ease;
  pointer-events: none;
}

.cvp-controls--visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.cvp-progress-row { width: 100%; }

.cvp-progress-track {
  width: 100%;
  height: 3px;
  background: rgba(255,255,255,0.2);
  position: relative;
  cursor: pointer;
  transition: height 0.15s;
  border-radius: 100px;
}

.cvp-progress-track:hover { height: 5px; }

.cvp-progress-buf {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  background: rgba(255,255,255,0.25);
  pointer-events: none;
  width: 0%;
  border-radius: 100px;
}

.cvp-progress-fill {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  background: var(--accent);
  pointer-events: none;
  width: 0%;
  border-radius: 100px;
}

.cvp-progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 12px;
  height: 12px;
  background: var(--accent);
  border-radius: 50%;
  pointer-events: none;
  transition: transform 0.15s;
  left: 0%;
  box-shadow: 0 0 6px var(--accent-glow);
}

.cvp-progress-track:hover .cvp-progress-thumb {
  transform: translate(-50%, -50%) scale(1);
}

.cvp-btn-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cvp-btn {
  background: transparent;
  border: none;
  color: #fff;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.15s, transform 0.12s;
  flex-shrink: 0;
}

.cvp-btn:hover { opacity: 1; transform: scale(1.12); }
.cvp-btn svg { width: 18px; height: 18px; }

.cvp-time {
  color: rgba(255,255,255,0.75);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  white-space: nowrap;
  margin-left: 2px;
}

.cvp-vol-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 72px;
  height: 3px;
  background: rgba(255,255,255,0.25);
  border-radius: 100px;
  outline: none;
  cursor: pointer;
}

.cvp-vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
}

.cvp-vol-slider::-moz-range-thumb {
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

/* Thumbnail with play overlay */
.cvp-thumb-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  cursor: pointer;
}

.cvp-thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.cvp-thumb-wrap:hover img { transform: scale(1.04); }

.cvp-thumb-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  transition: background 0.2s;
}

.cvp-thumb-wrap:hover .cvp-thumb-play { background: rgba(0,0,0,0.45); }

.cvp-thumb-play svg {
  width: 52px;
  height: 52px;
  color: #1a1200;
  background: var(--accent);
  border-radius: 50%;
  padding: 14px 12px 14px 16px;
  filter: drop-shadow(0 4px 16px var(--accent-glow));
  transition: transform 0.15s;
}

.cvp-thumb-wrap:hover .cvp-thumb-play svg { transform: scale(1.1); }
