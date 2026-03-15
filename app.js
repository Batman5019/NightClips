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
    {
      event: "INSERT",
      schema: "public",
      table: "uploads",
    },
    (payload) => {
      console.log("New upload detected", payload);
      banner.style.display = "flex";
    }
  )
  .subscribe();

window.addEventListener("load", () => {
  document.getElementById("splash").style.display = "none";
});
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
      return uploads.some(
        (f) => new Date(f.created_at).getTime() > dayAgo
      );
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

// Profile elements
const editUsernameInput = document.getElementById("editUsernameInput");
const profilePicInput = document.getElementById("profilePicInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const profilePicPreview = document.getElementById("profilePicPreview");
const profileMessage = document.getElementById("profileMessage");

// =====================
// HELPERS FOR USER RECORD
// =====================
async function getUserRecord(userId) {
  const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user record:", error);
    return null;
  }
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

  if (!username || !password) {
    authMessage.textContent = "Fill all fields";
    return;
  }

  const email = `${username}@fake.local`;
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  // create users row
  await supabaseClient.from("users").insert({
    id: data.user.id,
    username,
  });

  init();
};

loginBtn.onclick = async () => {
  authMessage.textContent = "";

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    authMessage.textContent = "Fill all fields";
    return;
  }

  const email = `${username}@fake.local`;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authMessage.textContent = error.message;
  } else {
    init();
  }
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
    if (!earned) {
      card.style.opacity = "0.4";
      subtitle.textContent += " (Locked)";
    }

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
    authPage.style.display = "flex";
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

videoInput.onchange = () => {
  videoFileName.textContent = videoInput.files[0]?.name || "No video selected";
};

thumbnailInput.onchange = () => {
  thumbnailFileName.textContent =
    thumbnailInput.files[0]?.name || "No thumbnail selected";
};

// =====================
// PROFILE LOGIC
// =====================
async function loadProfile() {
  const { data: auth, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr) {
    console.error("auth.getUser error:", authErr);
    return;
  }
  if (!auth.user) {
    console.warn("No logged in user in loadProfile");
    return;
  }

  const userRecord = await getUserRecord(auth.user.id);
  if (!userRecord) {
    console.warn("No users row found for this user in loadProfile");
    return;
  }

  editUsernameInput.value = userRecord.username || "";

  if (userRecord.profile_pic_url) {
    profilePicPreview.src = userRecord.profile_pic_url;
  } else {
    profilePicPreview.src = "";
  }
}

saveProfileBtn.onclick = async () => {
  profileMessage.textContent = "";
  console.log("Save profile clicked");

  const { data: auth, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr) {
    console.error("auth.getUser error:", authErr);
    profileMessage.textContent = "Auth error";
    return;
  }
  if (!auth.user) {
    profileMessage.textContent = "Not logged in";
    return;
  }

  const newUsername = editUsernameInput.value.trim();
  const picFile = profilePicInput.files[0];

  if (!newUsername && !picFile) {
    profileMessage.textContent = "Nothing to update";
    return;
  }

  const updateData = {};

  if (newUsername) {
    updateData.username = newUsername;
  }

  if (picFile) {
    const sanitizedName = picFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
    const path = `${auth.user.id}/profile/${Date.now()}_${sanitizedName}`;

    console.log("Uploading profile pic to:", path);

    const { error: picError } = await supabaseClient.storage
      .from("public-files")
      .upload(path, picFile, { upsert: true });

    if (picError) {
      console.error("Profile pic upload error:", picError);
      profileMessage.textContent = "Profile pic upload failed";
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from("public-files")
      .getPublicUrl(path);

    const profilePicUrl = publicUrlData.publicUrl;
    updateData.profile_pic_url = profilePicUrl;
  }

  console.log("Updating users row with:", updateData);

  const { error: updateError } = await supabaseClient
    .from("users")
    .update(updateData)
    .eq("id", auth.user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    profileMessage.textContent = "Failed to update profile";
    return;
  }

  if (updateData.profile_pic_url) {
    profilePicPreview.src = updateData.profile_pic_url;
  }

  profileMessage.textContent = "Profile updated!";
};

// =====================
// UPLOAD LOGIC
// =====================
uploadBtn.onclick = async () => {
  const videoFile = videoInput.files[0];
  const thumbnailFile = thumbnailInput.files[0];
  const title = document.getElementById("videoTitleInput").value.trim();

  if (!videoFile) {
    uploadMessage.textContent = "No video selected";
    return;
  }
  if (!title) {
    uploadMessage.textContent = "Enter a video title";
    return;
  }

  uploadMessage.textContent = "Uploading...";
  uploadBar.style.width = "0%";

  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth.user) {
    uploadMessage.textContent = "Not logged in";
    return;
  }

  const username = (await getUsernameById(auth.user.id)) || "Unknown";
  const displayTitle = `${title} [${username}]`;

  const timestamp = Date.now();
  const sanitizedVideoName = videoFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
  const videoPath = `${auth.user.id}/${timestamp}_${sanitizedVideoName}`;

  // Fake progress
  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 90) {
      progress += 5;
      uploadBar.style.width = progress + "%";
    }
  }, 100);

  try {
    const { error: videoError } = await supabaseClient.storage
      .from("public-files")
      .upload(videoPath, videoFile, { upsert: true });

    clearInterval(interval);
    uploadBar.style.width = "100%";

    if (videoError) throw videoError;

    let thumbnailPath = null;
    if (thumbnailFile) {
      const sanitizedThumb = thumbnailFile.name.replace(
        /[^a-z0-9.\-_]/gi,
        "_"
      );
      thumbnailPath = `${auth.user.id}/thumbnails/${timestamp}_${sanitizedThumb}`;
      const { error: thumbError } = await supabaseClient.storage
        .from("public-files")
        .upload(thumbnailPath, thumbnailFile, { upsert: true });
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
    uploadMessage.textContent =
      "Sorry that file is too big, compress it or use a new video";
  }
};

// =====================
// BASIC VIDEO CARD CONTENT (native controls)
// =====================
function createVideoCardContent(url) {
  const container = document.createElement("div");
  container.className = "video-container";

  const vid = document.createElement("video");
  vid.src = url;
  vid.controls = true;
  vid.className = "custom-video";
  vid.playsInline = true;

  container.appendChild(vid);
  return container;
}

// =====================
// LOAD GALLERY (ALL VIDEOS)
// =====================
async function loadGallery() {
  const allVideos = document.getElementById("allVideos");
  const banner = document.getElementById("newVideosBanner");

  const { data: uploads, error } = await supabaseClient
    .from("uploads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  if (uploads.length > 0) {
    const newest = new Date(uploads[0].created_at).getTime();

    if (latestUploadTime && newest > latestUploadTime) {
      banner.style.display = "flex";
    }

    latestUploadTime = newest;
  }

  allVideos.innerHTML = "";

  const { data: authData } = await supabaseClient.auth.getUser();

  uploads.forEach((file) => {
    const url = supabaseClient.storage
      .from("public-files")
      .getPublicUrl(file.file_path).data.publicUrl;

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.title = (file.title || "").toLowerCase();

    if (file.thumbnail_path) {
      const thumbUrl = supabaseClient.storage
        .from("public-files")
        .getPublicUrl(file.thumbnail_path).data.publicUrl;

      const img = document.createElement("img");
      img.src = thumbUrl;
      img.style.width = "100%";
      img.style.borderRadius = "6px";
      card.appendChild(img);
    } else if (file.file_type.startsWith("video")) {
      const videoContent = createVideoCardContent(url);
      card.appendChild(videoContent);
    }

    const vidTitle = document.createElement("p");
    vidTitle.textContent = file.title;
    vidTitle.style.fontWeight = "bold";
    vidTitle.style.margin = "5px 0";
    card.appendChild(vidTitle);

    const dl = document.createElement("a");
    dl.href = url;
    dl.download = "";
    dl.textContent = "Download";
    dl.style.display = "block";
    card.appendChild(dl);

    if (authData.user && authData.user.id === file.user_id) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = async () => {
        await supabaseClient.from("uploads").delete().eq("id", file.id);
        await supabaseClient.storage
          .from("public-files")
          .remove([file.file_path]);
        if (file.thumbnail_path) {
          await supabaseClient.storage
            .from("public-files")
            .remove([file.thumbnail_path]);
        }
        await loadGallery();
        await loadLibrary();
        await updateBadges();
      };
      card.appendChild(delBtn);
    }

    allVideos.appendChild(card);
  });

  // Re-apply any active search filter after gallery reloads
  const searchInput = document.getElementById("searchInput");
  if (searchInput && searchInput.value.trim()) {
    filterGallery(searchInput.value);
  }
}

// =====================
// SEARCH / FILTER GALLERY
// =====================
function filterGallery(query) {
  const cards = document.querySelectorAll("#allVideos .card");
  const q = query.toLowerCase().trim();
  cards.forEach((card) => {
    const title = card.dataset.title || "";
    card.style.display = title.includes(q) ? "flex" : "none";
  });
}

document.getElementById("searchInput").addEventListener("input", function () {
  filterGallery(this.value);
});

// =====================
// LOAD LIBRARY (USER VIDEOS)
// =====================
async function loadLibrary() {
  const userVideos = document.getElementById("userVideos");
  userVideos.innerHTML = "";

  const { data: authData } = await supabaseClient.auth.getUser();
  if (!authData.user) return;

  const { data: uploads, error } = await supabaseClient
    .from("uploads")
    .select("*")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  uploads.forEach((file) => {
    const url = supabaseClient.storage
      .from("public-files")
      .getPublicUrl(file.file_path).data.publicUrl;

    const card = document.createElement("div");
    card.className = "card";

    if (file.thumbnail_path) {
      const thumbUrl = supabaseClient.storage
        .from("public-files")
        .getPublicUrl(file.thumbnail_path).data.publicUrl;

      const img = document.createElement("img");
      img.src = thumbUrl;
      img.style.width = "100%";
      img.style.borderRadius = "6px";
      card.appendChild(img);
    } else if (file.file_type.startsWith("video")) {
      const videoContent = createVideoCardContent(url);
      card.appendChild(videoContent);
    }

    const vidTitle = document.createElement("p");
    vidTitle.textContent = file.title;
    vidTitle.style.fontWeight = "bold";
    vidTitle.style.margin = "5px 0";
    card.appendChild(vidTitle);

    const dl = document.createElement("a");
    dl.href = url;
    dl.download = "";
    dl.textContent = "Download";
    dl.style.display = "block";
    card.appendChild(dl);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await supabaseClient.from("uploads").delete().eq("id", file.id);
      await supabaseClient.storage.from("public-files").remove([file.file_path]);
      if (file.thumbnail_path) {
        await supabaseClient.storage
          .from("public-files")
          .remove([file.thumbnail_path]);
      }
      await loadGallery();
      await loadLibrary();
      await updateBadges();
    };
    card.appendChild(delBtn);

    userVideos.appendChild(card);
  });
}

// =====================
// BADGE UPDATE FOR CURRENT USER
// =====================
async function updateBadges() {
  const { data: authData } = await supabaseClient.auth.getUser();
  if (!authData.user) {
    renderBadgesTab([]);
    return;
  }

  const { data: uploads, error } = await supabaseClient
    .from("uploads")
    .select("*")
    .eq("user_id", authData.user.id);

  if (error) {
    console.error("Error loading uploads for badges:", error);
    renderBadgesTab([]);
    return;
  }

  const earned = BADGES.filter((badge) => badge.condition(uploads)).map(
    (b) => b.id
  );

  renderBadgesTab(earned);
}

// =====================
// NEW VIDEOS BANNER BUTTON
// =====================
document.getElementById("reloadVideosBtn").onclick = () => {
  document.getElementById("newVideosBanner").style.display = "none";
  loadGallery();
};

// =====================
// SPACEBAR PLAY/PAUSE (first video)
// =====================
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;

  const vid = document.querySelector("video");
  if (!vid) return;

  e.preventDefault();

  if (vid.paused) vid.play();
  else vid.pause();
});
