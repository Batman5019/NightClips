const { createClient } = supabase;

// =====================
// SUPABASE CLIENT
// =====================
const supabaseClient = createClient(
  "https://olyuzdwaeilrxvqfsgju.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seXV6ZHdhZWlscnh2cWZzZ2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjQ1ODAsImV4cCI6MjA4NjYwMDU4MH0.wVynFRV7IWKZwp3kl7PO6B5uWP535CoojZ9wVxcsJM4"
);

const banner = document.getElementById("newVideosBanner");

supabaseClient
  .channel("uploads-watch")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "uploads" },
    (payload) => {
      console.log("New upload detected", payload);
      banner.style.display = "flex";
    }
  )
  .subscribe();

// =====================
// BADGES DEFINITIONS
// =====================
const BADGES = [
  {
    id: "new",
    text: "New",
    subtitle: "Uploaded in last 24h",
    image: "https://iili.io/qFOHXln.jpg",
    condition: (uploads) => {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return uploads.some((f) => new Date(f.created_at).getTime() > dayAgo);
    },
  },
  {
    id: "video",
    text: "Video",
    subtitle: "Uploaded a video",
    image: "https://iili.io/qFOB4g2.jpg",
    condition: (uploads) =>
      uploads.some((f) => f.file_type && f.file_type.startsWith("video")),
  },
  {
    id: "mine",
    text: "Present",
    subtitle: "You've uploaded something!",
    image: "https://iili.io/qFOBse9.webp",
    condition: (uploads) => uploads.length > 0,
  },
];

// =====================
// ELEMENTS
// =====================
let latestUploadTime = 0;
const authPage = document.getElementById("authPage");
const dashboardPage = document.getElementById("dashboardPage");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const authMessage = document.getElementById("authMessage");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const videoInput = document.getElementById("videoInput");
const chooseVideoBtn = document.getElementById("chooseFileBtn");
const videoFileName = document.getElementById("fileName");
const thumbnailInput = document.getElementById("thumbnailInput");
const chooseThumbnailBtn = document.getElementById("chooseThumbnailBtn");
const thumbnailFileName = document.getElementById("thumbnailFileName");
const uploadBtn = document.getElementById("uploadBtn");
const uploadBar = document.getElementById("uploadBar");
const userIdText = document.getElementById("userId");
const uploadBarContainer = document.getElementById("uploadBarContainer");
const uploadMessage = document.getElementById("uploadMessage");
const editUsernameInput = document.getElementById("editUsernameInput");
const profilePicInput = document.getElementById("profilePicInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const profilePicPreview = document.getElementById("profilePicPreview");
const profileMessage = document.getElementById("profileMessage");

// =====================
// CUSTOM VIDEO PLAYER
// =====================
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function createVideoPlayer(url) {
  const wrapper = document.createElement("div");
  wrapper.className = "cvp-wrapper";

  const vid = document.createElement("video");
  vid.src = url;
  vid.playsInline = true;
  vid.preload = "metadata";
  vid.className = "cvp-video";

  const overlay = document.createElement("div");
  overlay.className = "cvp-overlay";

  // Big play button in center
  const bigPlay = document.createElement("button");
  bigPlay.className = "cvp-big-play";
  bigPlay.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
  overlay.appendChild(bigPlay);

  // Controls bar
  const controls = document.createElement("div");
  controls.className = "cvp-controls";

  // Progress row
  const progressRow = document.createElement("div");
  progressRow.className = "cvp-progress-row";

  const progressTrack = document.createElement("div");
  progressTrack.className = "cvp-progress-track";

  const progressBuf = document.createElement("div");
  progressBuf.className = "cvp-progress-buf";

  const progressFill = document.createElement("div");
  progressFill.className = "cvp-progress-fill";

  const progressThumb = document.createElement("div");
  progressThumb.className = "cvp-progress-thumb";

  progressTrack.appendChild(progressBuf);
  progressTrack.appendChild(progressFill);
  progressTrack.appendChild(progressThumb);
  progressRow.appendChild(progressTrack);
  controls.appendChild(progressRow);

  // Buttons row
  const btnRow = document.createElement("div");
  btnRow.className = "cvp-btn-row";

  // Play/pause
  const playBtn = document.createElement("button");
  playBtn.className = "cvp-btn cvp-play";
  playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;

  // Time display
  const timeDisplay = document.createElement("span");
  timeDisplay.className = "cvp-time";
  timeDisplay.textContent = "0:00 / 0:00";

  // Volume
  const volBtn = document.createElement("button");
  volBtn.className = "cvp-btn cvp-vol";
  volBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;

  const volSlider = document.createElement("input");
  volSlider.type = "range";
  volSlider.min = 0;
  volSlider.max = 1;
  volSlider.step = 0.05;
  volSlider.value = 1;
  volSlider.className = "cvp-vol-slider";

  // Fullscreen
  const fsBtn = document.createElement("button");
  fsBtn.className = "cvp-btn cvp-fs";
  fsBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;

  btnRow.appendChild(playBtn);
  btnRow.appendChild(timeDisplay);

  // Spacer
  const spacer = document.createElement("div");
  spacer.style.flex = "1";
  btnRow.appendChild(spacer);

  btnRow.appendChild(volBtn);
  btnRow.appendChild(volSlider);
  btnRow.appendChild(fsBtn);
  controls.appendChild(btnRow);
  wrapper.appendChild(vid);
  wrapper.appendChild(overlay);
  wrapper.appendChild(controls);

  // ---- STATE ----
  let playing = false;
  let muted = false;
  let controlsVisible = true;
  let hideTimeout = null;

  function showControls() {
    controls.classList.add("cvp-controls--visible");
    overlay.classList.add("cvp-overlay--dim");
    controlsVisible = true;
    clearTimeout(hideTimeout);
    if (playing) {
      hideTimeout = setTimeout(hideControls, 2800);
    }
  }

  function hideControls() {
    if (!playing) return;
    controls.classList.remove("cvp-controls--visible");
    overlay.classList.remove("cvp-overlay--dim");
    controlsVisible = false;
  }

  function updatePlayIcon(isPlaying) {
    const icon = isPlaying
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
    playBtn.innerHTML = icon;
    bigPlay.innerHTML = icon;
  }

  function togglePlay() {
    if (vid.paused) {
      vid.play();
    } else {
      vid.pause();
    }
  }

  vid.addEventListener("play", () => {
    playing = true;
    updatePlayIcon(true);
    bigPlay.style.opacity = "0";
    showControls();
  });

  vid.addEventListener("pause", () => {
    playing = false;
    updatePlayIcon(false);
    bigPlay.style.opacity = "1";
    showControls();
  });

  vid.addEventListener("ended", () => {
    playing = false;
    updatePlayIcon(false);
    bigPlay.style.opacity = "1";
    showControls();
  });

  vid.addEventListener("timeupdate", () => {
    if (!vid.duration) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    progressFill.style.width = pct + "%";
    progressThumb.style.left = pct + "%";
    timeDisplay.textContent = `${formatTime(vid.currentTime)} / ${formatTime(vid.duration)}`;
  });

  vid.addEventListener("loadedmetadata", () => {
    timeDisplay.textContent = `0:00 / ${formatTime(vid.duration)}`;
  });

  vid.addEventListener("progress", () => {
    if (vid.buffered.length > 0 && vid.duration) {
      const bufPct = (vid.buffered.end(vid.buffered.length - 1) / vid.duration) * 100;
      progressBuf.style.width = bufPct + "%";
    }
  });

  // Click progress track to seek
  progressTrack.addEventListener("click", (e) => {
    const rect = progressTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vid.currentTime = pct * vid.duration;
  });

  // Drag progress
  let dragging = false;
  progressTrack.addEventListener("mousedown", (e) => {
    dragging = true;
    const rect = progressTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vid.currentTime = pct * vid.duration;
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = progressTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vid.currentTime = pct * vid.duration;
  });
  document.addEventListener("mouseup", () => { dragging = false; });

  // Play/pause
  playBtn.addEventListener("click", togglePlay);
  bigPlay.addEventListener("click", togglePlay);
  vid.addEventListener("click", togglePlay);

  // Volume slider
  volSlider.addEventListener("input", () => {
    vid.volume = parseFloat(volSlider.value);
    muted = vid.volume === 0;
    updateVolIcon();
  });

  function updateVolIcon() {
    volBtn.innerHTML = muted || vid.volume === 0
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 19l1.27 1.27L20.27 19 5.27 4 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
  }

  volBtn.addEventListener("click", () => {
    muted = !muted;
    vid.muted = muted;
    volSlider.value = muted ? 0 : vid.volume || 0.7;
    updateVolIcon();
  });

  // Fullscreen
  fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen && wrapper.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    const inFs = !!document.fullscreenElement;
    fsBtn.innerHTML = inFs
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
    if (inFs) wrapper.classList.add("cvp-fullscreen");
    else wrapper.classList.remove("cvp-fullscreen");
  });

  // Show/hide controls on mouse move
  wrapper.addEventListener("mousemove", showControls);
  wrapper.addEventListener("mouseleave", () => {
    if (playing) hideControls();
  });

  // Touch support
  wrapper.addEventListener("touchstart", () => {
    if (controlsVisible) {
      togglePlay();
    } else {
      showControls();
    }
  }, { passive: true });

  // Keyboard shortcuts (when focused)
  wrapper.setAttribute("tabindex", "0");
  wrapper.addEventListener("keydown", (e) => {
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    if (e.code === "ArrowRight") { vid.currentTime = Math.min(vid.duration, vid.currentTime + 5); }
    if (e.code === "ArrowLeft")  { vid.currentTime = Math.max(0, vid.currentTime - 5); }
    if (e.code === "ArrowUp")    { vid.volume = Math.min(1, vid.volume + 0.1); volSlider.value = vid.volume; }
    if (e.code === "ArrowDown")  { vid.volume = Math.max(0, vid.volume - 0.1); volSlider.value = vid.volume; }
    if (e.code === "KeyF")       { fsBtn.click(); }
    if (e.code === "KeyM")       { volBtn.click(); }
  });

  // Show controls initially
  showControls();

  return wrapper;
}

// =====================
// HELPERS FOR USER RECORD
// =====================
async function getUserRecord(userId) {
  const { data, error } = await supabaseClient
    .from("users").select("*").eq("id", userId).single();
  if (error) { console.error("Error fetching user record:", error); return null; }
  return data;
}

async function getUsernameById(userId) {
  const record = await getUserRecord(userId);
  return record?.username || null;
}

// =====================
// AUTH
// =====================
signupBtn.onclick = async () => {
  authMessage.textContent = "";
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) { authMessage.textContent = "Fill all fields"; return; }
  const email = `${username}@fake.local`;
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) { authMessage.textContent = error.message; return; }
  await supabaseClient.from("users").insert({ id: data.user.id, username });
  init();
};

loginBtn.onclick = async () => {
  authMessage.textContent = "";
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) { authMessage.textContent = "Fill all fields"; return; }
  const email = `${username}@fake.local`;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) { authMessage.textContent = error.message; } else { init(); }
};

// =====================
// BADGES TAB RENDER
// =====================
function renderBadgesTab(earnedBadgeIds = []) {
  const badgesList = document.getElementById("badgesList");
  badgesList.innerHTML = "";
  BADGES.forEach((badge) => {
    const card = document.createElement("div");
    card.className = "badge-card";
    const img = document.createElement("img");
    img.src = badge.image;
    const title = document.createElement("div");
    title.className = "badge-title";
    title.textContent = badge.text;
    const subtitle = document.createElement("div");
    subtitle.className = "badge-subtitle";
    subtitle.textContent = badge.subtitle || "";
    const earned = earnedBadgeIds.includes(badge.id);
    if (!earned) { card.style.opacity = "0.4"; subtitle.textContent += " (Locked)"; }
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(subtitle);
    badgesList.appendChild(card);
  });
}

// =====================
// INIT
// =====================
async function init() {
  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) {
    authPage.style.display = "grid";
    dashboardPage.style.display = "none";
    return;
  }
  authPage.style.display = "none";
  dashboardPage.style.display = "block";
  userIdText.textContent = "#" + data.user.id.slice(0, 7);
  await loadProfile();
  await loadGallery();
  await loadLibrary();
  await updateBadges();
}

init();

// =====================
// TABS
// =====================
tabBtns.forEach((btn) => {
  btn.onclick = () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => (c.style.display = "none"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).style.display = "block";
  };
});

// =====================
// FILE INPUTS
// =====================
chooseVideoBtn.onclick = () => videoInput.click();
chooseThumbnailBtn.onclick = () => thumbnailInput.click();
videoInput.onchange = () => { videoFileName.textContent = videoInput.files[0]?.name || "No video selected"; };
thumbnailInput.onchange = () => { thumbnailFileName.textContent = thumbnailInput.files[0]?.name || "No thumbnail selected"; };

// =====================
// PROFILE LOGIC
// =====================
async function loadProfile() {
  const { data: auth, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr || !auth.user) return;
  const userRecord = await getUserRecord(auth.user.id);
  if (!userRecord) return;
  editUsernameInput.value = userRecord.username || "";
  if (userRecord.profile_pic_url) profilePicPreview.src = userRecord.profile_pic_url;
  else profilePicPreview.src = "";
}

saveProfileBtn.onclick = async () => {
  profileMessage.textContent = "";
  const { data: auth, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr) { profileMessage.textContent = "Auth error"; return; }
  if (!auth.user) { profileMessage.textContent = "Not logged in"; return; }
  const newUsername = editUsernameInput.value.trim();
  const picFile = profilePicInput.files[0];
  if (!newUsername && !picFile) { profileMessage.textContent = "Nothing to update"; return; }
  const updateData = {};
  if (newUsername) updateData.username = newUsername;
  if (picFile) {
    const sanitizedName = picFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
    const path = `${auth.user.id}/profile/${Date.now()}_${sanitizedName}`;
    const { error: picError } = await supabaseClient.storage.from("public-files").upload(path, picFile, { upsert: true });
    if (picError) { profileMessage.textContent = "Profile pic upload failed"; return; }
    const { data: publicUrlData } = supabaseClient.storage.from("public-files").getPublicUrl(path);
    updateData.profile_pic_url = publicUrlData.publicUrl;
  }
  const { error: updateError } = await supabaseClient.from("users").update(updateData).eq("id", auth.user.id);
  if (updateError) { profileMessage.textContent = "Failed to update profile"; return; }
  if (updateData.profile_pic_url) profilePicPreview.src = updateData.profile_pic_url;
  profileMessage.textContent = "Profile updated!";
};

// =====================
// UPLOAD LOGIC
// =====================
uploadBtn.onclick = async () => {
  const videoFile = videoInput.files[0];
  const thumbnailFile = thumbnailInput.files[0];
  const title = document.getElementById("videoTitleInput").value.trim();
  if (!videoFile) { uploadMessage.textContent = "No video selected"; return; }
  if (!title) { uploadMessage.textContent = "Enter a video title"; return; }
  uploadMessage.textContent = "Uploading...";
  uploadBar.style.width = "0%";
  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth.user) { uploadMessage.textContent = "Not logged in"; return; }
  const username = (await getUsernameById(auth.user.id)) || "Unknown";
  const displayTitle = `${title} [${username}]`;
  const timestamp = Date.now();
  const sanitizedVideoName = videoFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
  const videoPath = `${auth.user.id}/${timestamp}_${sanitizedVideoName}`;
  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 90) { progress += 5; uploadBar.style.width = progress + "%"; }
  }, 100);
  try {
    const { error: videoError } = await supabaseClient.storage.from("public-files").upload(videoPath, videoFile, { upsert: true });
    clearInterval(interval);
    uploadBar.style.width = "100%";
    if (videoError) throw videoError;
    let thumbnailPath = null;
    if (thumbnailFile) {
      const sanitizedThumb = thumbnailFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
      thumbnailPath = `${auth.user.id}/thumbnails/${timestamp}_${sanitizedThumb}`;
      const { error: thumbError } = await supabaseClient.storage.from("public-files").upload(thumbnailPath, thumbnailFile, { upsert: true });
      if (thumbError) throw thumbError;
    }
    await supabaseClient.from("uploads").insert({
      user_id: auth.user.id,
      title: displayTitle,
      file_name: videoFile.name,
      file_path: videoPath,
      file_type: videoFile.type,
      thumbnail_path: thumbnailPath,
    });
    videoInput.value = null;
    thumbnailInput.value = null;
    videoFileName.textContent = "No video selected";
    thumbnailFileName.textContent = "No thumbnail selected";
    document.getElementById("videoTitleInput").value = "";
    uploadBar.style.width = "0%";
    uploadMessage.textContent = "Upload complete!";
    await loadGallery();
    await loadLibrary();
    await updateBadges();
  } catch (err) {
    clearInterval(interval);
    uploadBar.style.width = "0%";
    console.error(err);
    uploadMessage.textContent = "Sorry that file is too big, compress it or use a new video";
  }
};

// =====================
// BUILD A CARD
// =====================
function buildCard(file, showDelete, onDelete) {
  const url = supabaseClient.storage.from("public-files").getPublicUrl(file.file_path).data.publicUrl;
  const card = document.createElement("div");
  card.className = "card";

  if (file.thumbnail_path) {
    // Show thumbnail, replace with player on click
    const thumbUrl = supabaseClient.storage.from("public-files").getPublicUrl(file.thumbnail_path).data.publicUrl;
    const thumbWrap = document.createElement("div");
    thumbWrap.className = "cvp-thumb-wrap";
    const img = document.createElement("img");
    img.src = thumbUrl;
    const playOverlay = document.createElement("div");
    playOverlay.className = "cvp-thumb-play";
    playOverlay.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
    thumbWrap.appendChild(img);
    thumbWrap.appendChild(playOverlay);
    thumbWrap.addEventListener("click", () => {
      const player = createVideoPlayer(url);
      card.replaceChild(player, thumbWrap);
      // auto-play
      const v = player.querySelector("video");
      if (v) v.play();
    });
    card.appendChild(thumbWrap);
  } else if (file.file_type && file.file_type.startsWith("video")) {
    card.appendChild(createVideoPlayer(url));
  }

  const vidTitle = document.createElement("p");
  vidTitle.textContent = file.title;
  card.appendChild(vidTitle);

  const dl = document.createElement("a");
  dl.href = url;
  dl.download = "";
  dl.textContent = "↓ Download";
  card.appendChild(dl);

  if (showDelete) {
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕ Delete";
    delBtn.onclick = onDelete;
    card.appendChild(delBtn);
  }

  return card;
}

// =====================
// LOAD GALLERY (ALL VIDEOS)
// =====================
async function loadGallery() {
  const allVideos = document.getElementById("allVideos");
  const { data: uploads, error } = await supabaseClient
    .from("uploads").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return; }

  if (uploads.length > 0) {
    const newest = new Date(uploads[0].created_at).getTime();
    if (latestUploadTime && newest > latestUploadTime) banner.style.display = "flex";
    latestUploadTime = newest;
  }

  allVideos.innerHTML = "";
  const { data: authData } = await supabaseClient.auth.getUser();

  uploads.forEach((file) => {
    const isOwner = authData.user && authData.user.id === file.user_id;
    const card = buildCard(file, isOwner, async () => {
      await supabaseClient.from("uploads").delete().eq("id", file.id);
      await supabaseClient.storage.from("public-files").remove([file.file_path]);
      if (file.thumbnail_path) await supabaseClient.storage.from("public-files").remove([file.thumbnail_path]);
      await loadGallery();
      await loadLibrary();
      await updateBadges();
    });
    allVideos.appendChild(card);
  });
}

// =====================
// LOAD LIBRARY (USER VIDEOS)
// =====================
async function loadLibrary() {
  const userVideos = document.getElementById("userVideos");
  userVideos.innerHTML = "";
  const { data: authData } = await supabaseClient.auth.getUser();
  if (!authData.user) return;

  const { data: uploads, error } = await supabaseClient
    .from("uploads").select("*").eq("user_id", authData.user.id).order("created_at", { ascending: false });
  if (error) { console.error(error); return; }

  uploads.forEach((file) => {
    const card = buildCard(file, true, async () => {
      await supabaseClient.from("uploads").delete().eq("id", file.id);
      await supabaseClient.storage.from("public-files").remove([file.file_path]);
      if (file.thumbnail_path) await supabaseClient.storage.from("public-files").remove([file.thumbnail_path]);
      await loadGallery();
      await loadLibrary();
      await updateBadges();
    });
    userVideos.appendChild(card);
  });
}

// =====================
// BADGE UPDATE
// =====================
async function updateBadges() {
  const { data: authData } = await supabaseClient.auth.getUser();
  if (!authData.user) { renderBadgesTab([]); return; }
  const { data: uploads, error } = await supabaseClient.from("uploads").select("*").eq("user_id", authData.user.id);
  if (error) { renderBadgesTab([]); return; }
  const earned = BADGES.filter((b) => b.condition(uploads)).map((b) => b.id);
  renderBadgesTab(earned);
}

// =====================
// NEW VIDEOS BANNER
// =====================
document.getElementById("reloadVideosBtn").onclick = () => {
  document.getElementById("newVideosBanner").style.display = "none";
  loadGallery();
};
