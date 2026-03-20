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
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "uploads" }, () => {
    if (banner) banner.style.display = "flex";
  })
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
    condition: (uploads) => uploads.some((f) => f.file_type && f.file_type.startsWith("video")),
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
let currentUserId = null;
const authPage       = document.getElementById("authPage");
const dashboardPage  = document.getElementById("dashboardPage");
const usernameInput  = document.getElementById("usernameInput");
const passwordInput  = document.getElementById("passwordInput");
const authMessage    = document.getElementById("authMessage");
const signupBtn      = document.getElementById("signupBtn");
const loginBtn       = document.getElementById("loginBtn");
const tabBtns        = document.querySelectorAll(".tab-btn");
const tabContents    = document.querySelectorAll(".tab-content");
const videoInput     = document.getElementById("videoInput");
const chooseVideoBtn = document.getElementById("chooseFileBtn");
const videoFileName  = document.getElementById("fileName");
const thumbnailInput        = document.getElementById("thumbnailInput");
const chooseThumbnailBtn    = document.getElementById("chooseThumbnailBtn");
const thumbnailFileName     = document.getElementById("thumbnailFileName");
const uploadBtn             = document.getElementById("uploadBtn");
const uploadBar             = document.getElementById("uploadBar");
const userIdText            = document.getElementById("userId");
const uploadMessage         = document.getElementById("uploadMessage");
const editUsernameInput     = document.getElementById("editUsernameInput");
const editDescriptionInput  = document.getElementById("editDescriptionInput");
const profilePicInput       = document.getElementById("profilePicInput");
const chooseProfilePicBtn   = document.getElementById("chooseProfilePicBtn");
const saveProfileBtn        = document.getElementById("saveProfileBtn");
const profilePicPreview     = document.getElementById("profilePicPreview");
const profileAvatarPlaceholder = document.getElementById("profileAvatarPlaceholder");
const profileMessage        = document.getElementById("profileMessage");
const profilePicFileName    = document.getElementById("profilePicFileName");
const newPicPreview         = document.getElementById("newPicPreview");
const newPicPreviewWrap     = document.getElementById("newPicPreviewWrap");
const thumbPreview          = document.getElementById("thumbPreview");
const thumbPreviewWrap      = document.getElementById("thumbPreviewWrap");
const headerProfile         = document.getElementById("headerProfile");
const headerAvatar          = document.getElementById("headerAvatar");
const headerUsername        = document.getElementById("headerUsername");

// =====================
// HELPERS
// =====================
async function getUserRecord(userId) {
  const { data, error } = await supabaseClient
    .from("users").select("*").eq("id", userId).single();
  if (error) { console.error("Error fetching user record:", error); return null; }
  return data;
}

const profilePicCache = {};
function invalidateProfileCache(userId) { delete profilePicCache[userId]; }

// =====================
// FRAME CAPTURE — from a local File (used during upload)
// =====================
function captureVideoFrame(file) {
  return new Promise((resolve) => {
    const url   = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src        = url;
    video.muted      = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    video.addEventListener("loadeddata", () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    });
    video.addEventListener("seeked", () => {
      const canvas  = document.createElement("canvas");
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
    });
    video.addEventListener("error", () => { URL.revokeObjectURL(url); resolve(null); });
    video.load();
  });
}

// =====================
// FRAME CAPTURE — from a remote URL (used in gallery/library cards)
// Throttled to max 2 concurrent captures to prevent lag
// =====================
let _frameQueue = [];
let _frameActive = 0;
const FRAME_CONCURRENCY = 2;

function attachFrameFromUrl(videoUrl, imgEl) {
  _frameQueue.push({ videoUrl, imgEl });
  _drainFrameQueue();
}

function _drainFrameQueue() {
  while (_frameActive < FRAME_CONCURRENCY && _frameQueue.length > 0) {
    const { videoUrl, imgEl } = _frameQueue.shift();
    _frameActive++;
    _captureFrame(videoUrl, imgEl).finally(() => {
      _frameActive--;
      _drainFrameQueue();
    });
  }
}

function _captureFrame(videoUrl, imgEl) {
  return new Promise((resolve) => {
    const video       = document.createElement("video");
    video.src         = videoUrl;
    video.crossOrigin = "anonymous";
    video.muted       = true;
    video.playsInline = true;
    video.preload     = "metadata";

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    });
    video.addEventListener("seeked", () => {
      try {
        const canvas  = document.createElement("canvas");
        canvas.width  = video.videoWidth  || 640;
        canvas.height = video.videoHeight || 360;
        canvas.getContext("2d").drawImage(video, 0, 0);
        imgEl.src = canvas.toDataURL("image/jpeg", 0.85);
      } catch (e) {
        console.warn("Frame capture blocked (CORS):", e);
      }
      video.src = "";
      resolve();
    });
    video.addEventListener("error", () => { video.src = ""; resolve(); });
    video.load();
  });
}

// =====================
// AUTH
// =====================
signupBtn.onclick = async () => {
  authMessage.textContent = "";
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) { authMessage.textContent = "Fill all fields"; return; }

  signupBtn.textContent = "Creating...";
  signupBtn.disabled = true;

  const email = `${username}@fake.local`;
  const { data, error } = await supabaseClient.auth.signUp({ email, password });

  signupBtn.textContent = "Create account";
  signupBtn.disabled = false;

  if (error) { authMessage.textContent = error.message; return; }

  const userId = data.user?.id;
  if (!userId) {
    authMessage.textContent = "Signup failed — try logging in if you already have an account.";
    return;
  }

  const { error: insertError } = await supabaseClient
    .from("users").upsert({ id: userId, username }, { onConflict: "id" });

  if (insertError) {
    authMessage.textContent = "Account created but profile setup failed: " + insertError.message;
    return;
  }

  init();
};

loginBtn.onclick = async () => {
  authMessage.textContent = "";
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) { authMessage.textContent = "Fill all fields"; return; }

  loginBtn.textContent = "Logging in...";
  loginBtn.disabled = true;

  const email = `${username}@fake.local`;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  loginBtn.textContent = "Log in";
  loginBtn.disabled = false;

  if (error) { authMessage.textContent = error.message; } else { init(); }
};

// =====================
// BADGES TAB RENDER
// =====================
function renderBadgesTab(earnedBadgeIds = []) {
  const badgesList = document.getElementById("badgesList");
  badgesList.innerHTML = "";
  BADGES.forEach((badge) => {
    const card     = document.createElement("div");
    card.className = "badge-card";
    const img      = document.createElement("img");
    img.src        = badge.image;
    const title    = document.createElement("div");
    title.className    = "badge-title";
    title.textContent  = badge.text;
    const subtitle = document.createElement("div");
    subtitle.className   = "badge-subtitle";
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
    authPage.style.display    = "flex";
    dashboardPage.style.display = "none";
    return;
  }
  authPage.style.display      = "none";
  dashboardPage.style.display = "block";
  currentUserId = data.user.id;
  userIdText.textContent      = "#" + data.user.id.slice(0, 7);

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
// LOGOUT
// =====================
document.getElementById("logoutBtn").onclick = async () => {
  await supabaseClient.auth.signOut();
  window.location.reload();
};

// =====================
// DELETE ACCOUNT
// =====================
const deleteModal      = document.getElementById("deleteModal");
const cancelDeleteBtn  = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

document.getElementById("deleteAccountBtn").onclick = () => { deleteModal.style.display = "flex"; };
cancelDeleteBtn.onclick = () => { deleteModal.style.display = "none"; };
deleteModal.onclick = (e) => { if (e.target === deleteModal) deleteModal.style.display = "none"; };

confirmDeleteBtn.onclick = async () => {
  confirmDeleteBtn.textContent = "Deleting...";
  confirmDeleteBtn.disabled    = true;

  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth.user) { window.location.reload(); return; }

  const userId = auth.user.id;
  const { data: uploads } = await supabaseClient
    .from("uploads").select("file_path, thumbnail_path").eq("user_id", userId);

  if (uploads && uploads.length > 0) {
    const paths = uploads.flatMap(u => [
      u.file_path,
      u.thumbnail_path && u.thumbnail_path !== u.file_path ? u.thumbnail_path : null
    ]).filter(Boolean);
    if (paths.length > 0) await supabaseClient.storage.from("public-files").remove(paths);
    await supabaseClient.from("uploads").delete().eq("user_id", userId);
  }

  await supabaseClient.from("comments").delete().eq("user_id", userId);
  await supabaseClient.from("users").delete().eq("id", userId);
  await supabaseClient.auth.signOut();
  window.location.reload();
};

// =====================
// UPLOAD TYPE TOGGLE
// =====================
let uploadType = "video";

const typeVideoBtn       = document.getElementById("typeVideoBtn");
const typeImageBtn       = document.getElementById("typeImageBtn");
const chooseFileBtnLabel = document.getElementById("chooseFileBtnLabel");
const thumbnailRow       = document.getElementById("thumbnailRow");

typeVideoBtn.onclick = () => {
  uploadType = "video";
  typeVideoBtn.classList.add("active");
  typeImageBtn.classList.remove("active");
  videoInput.accept         = "video/*";
  chooseFileBtnLabel.textContent = "Choose Video";
  videoFileName.textContent      = "No file selected";
  videoInput.value          = "";
  thumbnailRow.style.display = "flex";
};

typeImageBtn.onclick = () => {
  uploadType = "image";
  typeImageBtn.classList.add("active");
  typeVideoBtn.classList.remove("active");
  videoInput.accept              = "image/*";
  chooseFileBtnLabel.textContent = "Choose Image";
  videoFileName.textContent      = "No file selected";
  videoInput.value               = "";
  thumbnailRow.style.display     = "none";
  thumbPreviewWrap.style.display = "none";
};

chooseVideoBtn.onclick      = () => videoInput.click();
chooseThumbnailBtn.onclick  = () => thumbnailInput.click();
chooseProfilePicBtn.onclick = () => profilePicInput.click();

videoInput.onchange = () => {
  const file = videoInput.files[0];
  videoFileName.textContent = file?.name || "No file selected";
  if (file && uploadType === "image") {
    const reader = new FileReader();
    reader.onload = (e) => { thumbPreview.src = e.target.result; thumbPreviewWrap.style.display = "block"; };
    reader.readAsDataURL(file);
  } else if (uploadType === "image") {
    thumbPreviewWrap.style.display = "none";
  }
};

thumbnailInput.onchange = () => {
  const file = thumbnailInput.files[0];
  thumbnailFileName.textContent = file?.name || "No thumbnail selected";
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => { thumbPreview.src = e.target.result; thumbPreviewWrap.style.display = "block"; };
    reader.readAsDataURL(file);
  } else {
    thumbPreviewWrap.style.display = "none";
  }
};

profilePicInput.onchange = () => {
  const file = profilePicInput.files[0];
  profilePicFileName.textContent = file?.name || "No picture selected";
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => { newPicPreview.src = e.target.result; newPicPreviewWrap.style.display = "block"; };
    reader.readAsDataURL(file);
  } else {
    newPicPreviewWrap.style.display = "none";
  }
};

// =====================
// UPDATE HEADER PROFILE
// =====================
function updateHeaderProfile(username, picUrl) {
  headerUsername.textContent = username || "";
  if (picUrl) {
    headerAvatar.src          = picUrl;
    headerAvatar.style.display = "block";
  } else {
    headerAvatar.src           = "";
    headerAvatar.style.display = "none";
  }
  headerProfile.style.display = "flex";
}

// =====================
// PROFILE LOGIC
// =====================
async function loadProfile() {
  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth.user) return;

  let userRecord = await getUserRecord(auth.user.id);

  if (!userRecord) {
    const username = auth.user.email?.split("@")[0] || "user";
    await supabaseClient.from("users").upsert({ id: auth.user.id, username }, { onConflict: "id" });
    userRecord = await getUserRecord(auth.user.id);
  }

  if (!userRecord) return;

  editUsernameInput.value = userRecord.username || "";
  if (editDescriptionInput) editDescriptionInput.value = userRecord.description || "";

  if (userRecord.profile_pic_url) {
    profilePicPreview.src          = userRecord.profile_pic_url;
    profilePicPreview.style.display      = "block";
    profileAvatarPlaceholder.style.display = "none";
  } else {
    profilePicPreview.style.display      = "none";
    profileAvatarPlaceholder.style.display = "flex";
  }

  updateHeaderProfile(userRecord.username, userRecord.profile_pic_url);
}

// View own channel
document.getElementById("viewChannelBtn").onclick = () => {
  if (currentUserId) window.location.href = `/NightClips/channel.html?id=${currentUserId}`;
};

saveProfileBtn.onclick = async () => {
  profileMessage.textContent   = "";
  saveProfileBtn.textContent   = "Saving...";
  saveProfileBtn.disabled      = true;

  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth.user) {
    profileMessage.textContent = "Not logged in";
    saveProfileBtn.textContent = "Save changes";
    saveProfileBtn.disabled    = false;
    return;
  }

  const newUsername    = editUsernameInput.value.trim();
  const newDescription = (editDescriptionInput ? editDescriptionInput.value : "").trim();
  const picFile        = profilePicInput.files[0];

  if (!newUsername) {
    profileMessage.textContent = "Username cannot be empty";
    saveProfileBtn.textContent = "Save changes";
    saveProfileBtn.disabled    = false;
    return;
  }

  const updateData = { username: newUsername, description: newDescription };

  if (picFile) {
    const sanitizedName = picFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
    const path = `${auth.user.id}/profile/${Date.now()}_${sanitizedName}`;
    const { error: picError } = await supabaseClient.storage
      .from("public-files").upload(path, picFile, { upsert: true });

    if (picError) {
      profileMessage.textContent = "Profile pic upload failed: " + picError.message;
      saveProfileBtn.textContent = "Save changes";
      saveProfileBtn.disabled    = false;
      return;
    }
    const { data: pub } = supabaseClient.storage.from("public-files").getPublicUrl(path);
    updateData.profile_pic_url = pub.publicUrl;
  }

  const { error: updateError } = await supabaseClient
    .from("users").update(updateData).eq("id", auth.user.id);

  if (updateError) {
    profileMessage.textContent = "Failed: " + updateError.message;
    saveProfileBtn.textContent = "Save changes";
    saveProfileBtn.disabled    = false;
    return;
  }

  if (updateData.profile_pic_url) {
    profilePicPreview.src                  = updateData.profile_pic_url;
    profilePicPreview.style.display        = "block";
    profileAvatarPlaceholder.style.display = "none";
    newPicPreviewWrap.style.display        = "none";
    profilePicInput.value                  = "";
    profilePicFileName.textContent         = "No picture selected";
  }

  invalidateProfileCache(auth.user.id);
  const finalRecord = await getUserRecord(auth.user.id);
  updateHeaderProfile(finalRecord?.username, finalRecord?.profile_pic_url);

  profileMessage.textContent = "Profile updated!";
  saveProfileBtn.textContent = "Save changes";
  saveProfileBtn.disabled    = false;

  await loadGallery();
  await loadLibrary();
};

// =====================
// UPLOAD LOGIC
// =====================
uploadBtn.onclick = async () => {
  const mediaFile     = videoInput.files[0];
  const thumbnailFile = thumbnailInput.files[0];
  const title         = document.getElementById("videoTitleInput").value.trim();

  if (!mediaFile) { uploadMessage.textContent = "No file selected"; return; }
  if (!title)     { uploadMessage.textContent = "Enter a title"; return; }

  uploadMessage.textContent = "Uploading...";
  uploadBar.style.width = "0%";

  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth.user) { uploadMessage.textContent = "Not logged in"; return; }

  const timestamp     = Date.now();
  const sanitizedName = mediaFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
  const mediaPath     = `${auth.user.id}/${timestamp}_${sanitizedName}`;
  const isImage       = mediaFile.type.startsWith("image");

  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 90) { progress += 5; uploadBar.style.width = progress + "%"; }
  }, 100);

  try {
    const { error: mediaError } = await supabaseClient.storage
      .from("public-files").upload(mediaPath, mediaFile, { upsert: true });
    clearInterval(interval);
    uploadBar.style.width = "100%";
    if (mediaError) throw mediaError;

    let thumbnailPath = null;

    if (isImage) {
      thumbnailPath = mediaPath;
    } else if (thumbnailFile) {
      const sanitizedThumb = thumbnailFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
      thumbnailPath = `${auth.user.id}/thumbnails/${timestamp}_${sanitizedThumb}`;
      const { error: thumbError } = await supabaseClient.storage
        .from("public-files").upload(thumbnailPath, thumbnailFile, { upsert: true });
      if (thumbError) throw thumbError;
    } else {
      // No thumbnail — capture a frame from the video file
      uploadMessage.textContent = "Generating thumbnail...";
      const frameBlob = await captureVideoFrame(mediaFile);
      if (frameBlob) {
        thumbnailPath = `${auth.user.id}/thumbnails/${timestamp}_thumb.jpg`;
        const { error: frameError } = await supabaseClient.storage
          .from("public-files").upload(thumbnailPath, frameBlob, { upsert: true, contentType: "image/jpeg" });
        if (frameError) { console.warn("Frame upload failed:", frameError); thumbnailPath = null; }
      }
    }

    await supabaseClient.from("uploads").insert({
      user_id:        auth.user.id,
      title,
      file_name:      mediaFile.name,
      file_path:      mediaPath,
      file_type:      mediaFile.type,
      thumbnail_path: thumbnailPath,
    });

    videoInput.value = null;
    thumbnailInput.value = null;
    videoFileName.textContent      = "No file selected";
    thumbnailFileName.textContent  = "No thumbnail selected";
    thumbPreviewWrap.style.display = "none";
    document.getElementById("videoTitleInput").value = "";
    uploadBar.style.width     = "0%";
    uploadMessage.textContent = "Upload complete!";

    await loadGallery();
    await loadLibrary();
    await updateBadges();
  } catch (err) {
    clearInterval(interval);
    uploadBar.style.width     = "0%";
    console.error(err);
    uploadMessage.textContent = "Upload failed — file may be too big";
  }
};

// =====================
// VIDEO CARD CONTENT (inline player fallback)
// =====================
function createVideoCardContent(url) {
  const container = document.createElement("div");
  container.className = "video-container";
  const vid = document.createElement("video");
  vid.src       = url;
  vid.controls  = true;
  vid.className = "custom-video";
  vid.playsInline = true;
  container.appendChild(vid);
  return container;
}

// =====================
// WATCHER BADGE SYSTEM
// =====================
const WATCHER_BADGES = [
  { min: 10000, img: "https://iili.io/qjDTvbR.png",  alt: "10k Watchers" },
  { min: 1000,  img: "https://iili.io/qjDTOJa.png", alt: "1k Watchers"  },
  { min: 100,   img: "https://iili.io/qjDTSxp.png",  alt: "100 Watchers" },
];
const CREATOR_BADGE = { img: "https://iili.io/qjDTL5G.png", alt: "Creator" };
const watcherCountCache = {};

function getBadgeForUser(username, watcherCount) {
  if (username === "NightClipsOfficial") return CREATOR_BADGE;
  for (const b of WATCHER_BADGES) {
    if (watcherCount >= b.min) return b;
  }
  return null;
}

function makeBadgeEl(badge) {
  const img = document.createElement("img");
  img.src = badge.img; img.alt = badge.alt; img.title = badge.alt;
  img.className = "username-badge";
  return img;
}

// =====================
// BATCH FETCH USERS
// =====================
async function fetchUsersForUploads(uploads) {
  const uniqueIds = [...new Set(uploads.map((u) => u.user_id))];
  const { data, error } = await supabaseClient
    .from("users").select("id, username, profile_pic_url").in("id", uniqueIds);
  if (error) { console.error("Error batch-fetching users:", error); return {}; }
  const map = {};
  (data || []).forEach((u) => {
    map[u.id] = u;
    profilePicCache[u.id] = u.profile_pic_url || null;
  });
  // Fetch watcher counts for badge display
  const uncached = uniqueIds.filter(id => watcherCountCache[id] === undefined);
  if (uncached.length > 0) {
    const { data: wd } = await supabaseClient
      .from("watches").select("channel_id").in("channel_id", uncached);
    uncached.forEach(id => { watcherCountCache[id] = 0; });
    (wd || []).forEach(w => { watcherCountCache[w.channel_id] = (watcherCountCache[w.channel_id] || 0) + 1; });
  }
  return map;
}

function buildCardTitleRowSync(file, userMap) {
  const row      = document.createElement("div");
  row.className  = "card-title-row";

  const user     = userMap[file.user_id];
  const picUrl   = user?.profile_pic_url || null;
  const username = user?.username || null;

  let avatarNode;
  if (picUrl) {
    const av = document.createElement("img");
    av.src = picUrl; av.className = "card-uploader-avatar"; av.alt = "";
    avatarNode = av;
  } else {
    const av = document.createElement("div");
    av.className = "card-uploader-avatar-placeholder"; av.textContent = "?";
    avatarNode = av;
  }
  avatarNode.style.cursor = "pointer";
  avatarNode.onclick = (e) => {
    e.stopPropagation();
    window.location.href = `/NightClips/channel.html?id=${file.user_id}`;
  };
  row.appendChild(avatarNode);

  const textWrap = document.createElement("div");
  textWrap.className = "card-title-text";

  const titleEl = document.createElement("p");
  titleEl.className   = "vid-title";
  titleEl.textContent = (file.title || "").replace(/\s*\[.+\]\s*$/, "").trim();
  textWrap.appendChild(titleEl);

  if (username) {
    const uploaderRow = document.createElement("div");
    uploaderRow.className = "vid-uploader-row";
    uploaderRow.style.cursor = "pointer";
    uploaderRow.onclick = (e) => {
      e.stopPropagation();
      window.location.href = `/NightClips/channel.html?id=${file.user_id}`;
    };

    const uploaderEl = document.createElement("span");
    uploaderEl.className   = "vid-uploader";
    uploaderEl.textContent = username;
    uploaderRow.appendChild(uploaderEl);

    const wCount = watcherCountCache[file.user_id] || 0;
    const badge  = getBadgeForUser(username, wCount);
    if (badge) uploaderRow.appendChild(makeBadgeEl(badge));

    textWrap.appendChild(uploaderRow);
  }

  row.appendChild(textWrap);
  return row;
}

// =====================
// MAKE CARD THUMBNAIL
// Shows stored thumbnail, or captures a live frame for videos with none
// =====================
function makeCardThumb(file, mediaLink) {
  const isImage = file.file_type && file.file_type.startsWith("image");

  if (file.thumbnail_path) {
    const thumbUrl = supabaseClient.storage.from("public-files").getPublicUrl(file.thumbnail_path).data.publicUrl;
    const img = document.createElement("img");
    img.src       = thumbUrl;
    img.className = "card-thumb";
    img.alt       = "";
    if (isImage) img.style.aspectRatio = "auto";
    mediaLink.appendChild(img);
  } else if (!isImage) {
    // Video with no stored thumbnail — capture a frame live
    const img = document.createElement("img");
    img.className = "card-thumb";
    img.alt       = "";
    // Show placeholder colour while frame loads
    img.style.background = "#0d0d0d";
    mediaLink.appendChild(img);
    const videoUrl = supabaseClient.storage.from("public-files").getPublicUrl(file.file_path).data.publicUrl;
    attachFrameFromUrl(videoUrl, img);
  } else {
    // Image with no thumbnail path (shouldn't happen, but fallback)
    const placeholder = document.createElement("div");
    placeholder.className = "card-thumb-placeholder";
    placeholder.innerHTML = `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    mediaLink.appendChild(placeholder);
  }
}

// =====================
// GALLERY STATE
// =====================
const VIDEOS_PER_PAGE = 10;
let galleryAllUploads = [];
let galleryUserMap    = {};
let galleryAuthUser   = null;
let galleryPage       = 1;
let galleryQuery      = "";

async function loadGallery() {
  const { data: uploads, error } = await supabaseClient
    .from("uploads").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return; }

  if (uploads.length > 0) {
    const newest = new Date(uploads[0].created_at).getTime();
    if (latestUploadTime && newest > latestUploadTime && banner) banner.style.display = "flex";
    latestUploadTime = newest;
  }

  galleryAllUploads = uploads;
  galleryUserMap    = uploads.length > 0 ? await fetchUsersForUploads(uploads) : {};
  const { data: authData } = await supabaseClient.auth.getUser();
  galleryAuthUser   = authData.user || null;

  galleryPage = 1;
  renderGalleryPage();
}

function renderGalleryPage() {
  const allVideos = document.getElementById("allVideos");
  allVideos.innerHTML = "";

  const filtered = galleryQuery
    ? galleryAllUploads.filter((f) =>
        (f.title || "").replace(/\s*\[.+\]\s*$/, "").trim().toLowerCase().includes(galleryQuery)
      )
    : galleryAllUploads;

  const totalPages  = Math.max(1, Math.ceil(filtered.length / VIDEOS_PER_PAGE));
  if (galleryPage > totalPages) galleryPage = totalPages;

  const start       = (galleryPage - 1) * VIDEOS_PER_PAGE;
  const pageUploads = filtered.slice(start, start + VIDEOS_PER_PAGE);

  pageUploads.forEach((file) => {
    const url  = supabaseClient.storage.from("public-files").getPublicUrl(file.file_path).data.publicUrl;
    const card = document.createElement("div");
    card.className = "card";

    const mediaLink = document.createElement("a");
    mediaLink.href      = `/NightClips/watch.html?id=${file.id}`;
    mediaLink.className = "card-media-link";

    makeCardThumb(file, mediaLink);
    card.appendChild(mediaLink);

    const titleRow = buildCardTitleRowSync(file, galleryUserMap);
    titleRow.style.cursor = "pointer";
    titleRow.onclick = () => { window.location.href = `/NightClips/watch.html?id=${file.id}`; };
    card.appendChild(titleRow);

    const dl = document.createElement("a");
    dl.href = url; dl.download = ""; dl.textContent = "Download"; dl.style.display = "block";
    card.appendChild(dl);

    if (galleryAuthUser && galleryAuthUser.id === file.user_id) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = async () => {
        await supabaseClient.from("uploads").delete().eq("id", file.id);
        await supabaseClient.storage.from("public-files").remove([file.file_path]);
        if (file.thumbnail_path && file.thumbnail_path !== file.file_path)
          await supabaseClient.storage.from("public-files").remove([file.thumbnail_path]);
        await loadGallery(); await loadLibrary(); await updateBadges();
      };
      card.appendChild(delBtn);
    }

    allVideos.appendChild(card);
  });

  renderPagination(totalPages, filtered.length);
}

function renderPagination(totalPages, totalCount) {
  let pager = document.getElementById("galleryPagination");
  if (!pager) {
    pager = document.createElement("div");
    pager.id        = "galleryPagination";
    pager.className = "pagination";
    document.getElementById("gallery").appendChild(pager);
  }
  pager.innerHTML = "";
  if (totalPages <= 1) return;

  const controls = document.createElement("div");
  controls.className = "pagination-controls";

  const prev = document.createElement("button");
  prev.textContent = "←";
  prev.className   = "page-btn nav-btn" + (galleryPage === 1 ? " disabled" : "");
  prev.disabled    = galleryPage === 1;
  prev.onclick     = () => { _frameQueue = []; galleryPage--; renderGalleryPage(); window.scrollTo(0, 0); };
  controls.appendChild(prev);

  const range = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= galleryPage - range && i <= galleryPage + range)) {
      if (i === galleryPage - range && i > 2) {
        const gap = document.createElement("span");
        gap.className = "page-gap"; gap.textContent = "…";
        controls.appendChild(gap);
      }
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className   = "page-btn" + (i === galleryPage ? " active" : "");
      btn.onclick     = ((page) => () => { _frameQueue = []; galleryPage = page; renderGalleryPage(); window.scrollTo(0, 0); })(i);
      controls.appendChild(btn);
      if (i === galleryPage + range && i < totalPages - 1) {
        const gap = document.createElement("span");
        gap.className = "page-gap"; gap.textContent = "…";
        controls.appendChild(gap);
      }
    }
  }

  const next = document.createElement("button");
  next.textContent = "→";
  next.className   = "page-btn nav-btn" + (galleryPage === totalPages ? " disabled" : "");
  next.disabled    = galleryPage === totalPages;
  next.onclick     = () => { _frameQueue = []; galleryPage++; renderGalleryPage(); window.scrollTo(0, 0); };
  controls.appendChild(next);

  pager.appendChild(controls);

  const label = document.createElement("span");
  label.className   = "page-label";
  label.textContent = `Page ${galleryPage} of ${totalPages}  ·  ${totalCount} video${totalCount !== 1 ? "s" : ""}`;
  pager.appendChild(label);
}

// =====================
// SEARCH — videos + users
// =====================
let searchDebounce = null;

document.getElementById("searchInput").addEventListener("input", function () {
  galleryQuery = this.value.toLowerCase().trim();
  galleryPage  = 1;
  renderGalleryPage();

  clearTimeout(searchDebounce);
  const q = this.value.trim();
  if (!q) {
    document.getElementById("userResults").style.display    = "none";
    document.getElementById("userResultsList").innerHTML = "";
    return;
  }
  searchDebounce = setTimeout(() => searchUsers(q), 300);
});

async function searchUsers(query) {
  const { data: users, error } = await supabaseClient
    .from("users").select("id, username, profile_pic_url")
    .ilike("username", `%${query}%`).limit(6);

  const wrap = document.getElementById("userResults");
  const list = document.getElementById("userResultsList");
  list.innerHTML = "";

  if (error || !users || users.length === 0) { wrap.style.display = "none"; return; }

  wrap.style.display = "block";
  users.forEach((user) => {
    const item = document.createElement("div");
    item.className    = "user-result-item";
    item.style.cursor = "pointer";
    item.onclick      = () => { window.location.href = `/NightClips/channel.html?id=${user.id}`; };

    if (user.profile_pic_url) {
      const av = document.createElement("img");
      av.src = user.profile_pic_url; av.className = "user-result-avatar";
      item.appendChild(av);
    } else {
      const av = document.createElement("div");
      av.className   = "user-result-avatar-ph";
      av.textContent = (user.username || "?")[0].toUpperCase();
      item.appendChild(av);
    }

    const name = document.createElement("span");
    name.className   = "user-result-name";
    name.textContent = user.username || "Unknown";
    item.appendChild(name);

    const arrow = document.createElement("span");
    arrow.className   = "user-result-arrow";
    arrow.innerHTML   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
    item.appendChild(arrow);

    list.appendChild(item);
  });
}

// =====================
// LIBRARY
// =====================
async function loadLibrary() {
  const userVideos = document.getElementById("userVideos");
  userVideos.innerHTML = "";

  const { data: authData } = await supabaseClient.auth.getUser();
  if (!authData.user) return;

  const { data: uploads, error } = await supabaseClient
    .from("uploads").select("*").eq("user_id", authData.user.id).order("created_at", { ascending: false });
  if (error) { console.error(error); return; }

  const userMap = uploads.length > 0 ? await fetchUsersForUploads(uploads) : {};

  uploads.forEach((file) => {
    const url  = supabaseClient.storage.from("public-files").getPublicUrl(file.file_path).data.publicUrl;
    const card = document.createElement("div");
    card.className = "card";

    const mediaLink = document.createElement("a");
    mediaLink.href      = `/NightClips/watch.html?id=${file.id}`;
    mediaLink.className = "card-media-link";
    makeCardThumb(file, mediaLink);
    card.appendChild(mediaLink);

    card.appendChild(buildCardTitleRowSync(file, userMap));

    const dl = document.createElement("a");
    dl.href = url; dl.download = ""; dl.textContent = "Download"; dl.style.display = "block";
    card.appendChild(dl);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await supabaseClient.from("uploads").delete().eq("id", file.id);
      await supabaseClient.storage.from("public-files").remove([file.file_path]);
      if (file.thumbnail_path && file.thumbnail_path !== file.file_path)
        await supabaseClient.storage.from("public-files").remove([file.thumbnail_path]);
      await loadGallery(); await loadLibrary(); await updateBadges();
    };
    card.appendChild(delBtn);

    userVideos.appendChild(card);
  });
}

// =====================
// BADGE UPDATE
// =====================
async function updateBadges() {
  const { data: authData } = await supabaseClient.auth.getUser();
  if (!authData.user) { renderBadgesTab([]); return; }
  const { data: uploads, error } = await supabaseClient
    .from("uploads").select("*").eq("user_id", authData.user.id);
  if (error) { renderBadgesTab([]); return; }
  const earned = BADGES.filter((badge) => badge.condition(uploads)).map((b) => b.id);
  renderBadgesTab(earned);
}

// =====================
// NEW VIDEOS BANNER
// =====================
document.getElementById("reloadVideosBtn").onclick = () => {
  document.getElementById("newVideosBanner").style.display = "none";
  loadGallery();
};

// =====================
// SPACEBAR PLAY/PAUSE
// =====================
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;
  const vid = document.querySelector("video");
  if (!vid) return;
  e.preventDefault();
  if (vid.paused) vid.play(); else vid.pause();
});
