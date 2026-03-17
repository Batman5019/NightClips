const { createClient } = supabase;

const supabaseClient = createClient(
  "https://olyuzdwaeilrxvqfsgju.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seXV6ZHdhZWlscnh2cWZzZ2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjQ1ODAsImV4cCI6MjA4NjYwMDU4MH0.wVynFRV7IWKZwp3kl7PO6B5uWP535CoojZ9wVxcsJM4"
);

// =====================
// HELPERS
// =====================
const params   = new URLSearchParams(window.location.search);
const videoId  = params.get("id");

function cleanTitle(t) {
  return (t || "").replace(/\s*\[.+\]\s*$/, "").trim();
}

async function getUserRecord(userId) {
  const { data } = await supabaseClient
    .from("users").select("id, username, profile_pic_url").eq("id", userId).single();
  return data || null;
}

function makeAvatar(picUrl, size = 36) {
  if (picUrl) {
    const img = document.createElement("img");
    img.src = picUrl;
    img.className = "watch-avatar";
    img.style.width = size + "px";
    img.style.height = size + "px";
    return img;
  }
  const div = document.createElement("div");
  div.className = "watch-avatar-placeholder";
  div.style.width = size + "px";
  div.style.height = size + "px";
  div.textContent = "?";
  return div;
}

// =====================
// REDIRECT IF NOT LOGGED IN
// =====================
async function getAuthUser() {
  const { data } = await supabaseClient.auth.getUser();
  return data?.user || null;
}

// =====================
// LOAD VIDEO
// =====================
async function loadVideo() {
  if (!videoId) {
    document.querySelector(".watch-main").innerHTML =
      `<div class="watch-error"><p>No video specified.</p><a href="/NightClips/">Go home</a></div>`;
    return;
  }

  const { data: file, error } = await supabaseClient
    .from("uploads").select("*").eq("id", videoId).single();

  if (error || !file) {
    document.querySelector(".watch-main").innerHTML =
      `<div class="watch-error"><p>Video not found.</p><a href="/NightClips/">Go home</a></div>`;
    return;
  }

  // Set video src
  const videoUrl = supabaseClient.storage.from("public-files").getPublicUrl(file.file_path).data.publicUrl;
  const vid = document.getElementById("watchVideo");
  vid.src = videoUrl;

  // Set page title
  const title = cleanTitle(file.title);
  document.title = title + " · NightClips";
  document.getElementById("watchTitle").textContent = title;

  // Download link
  const dlBtn = document.getElementById("watchDownload");
  dlBtn.href = videoUrl;
  dlBtn.download = file.file_name || "video";

  // Uploader info
  const uploader = await getUserRecord(file.user_id);
  const avatarWrap = document.getElementById("watchAvatarWrap");
  avatarWrap.appendChild(makeAvatar(uploader?.profile_pic_url, 36));
  document.getElementById("watchUsername").textContent = uploader?.username || "Unknown";

  // Load comments + recommended in parallel
  const authUser = await getAuthUser();
  await Promise.all([
    loadComments(file.id, authUser),
    loadRecommended(file.id),
  ]);

  // Show comment form or login message
  if (authUser) {
    document.getElementById("commentForm").style.display = "flex";
  } else {
    document.getElementById("commentLoginMsg").style.display = "block";
  }

  // Comment submit
  document.getElementById("commentSubmit").onclick = () => submitComment(file.id, authUser);
  document.getElementById("commentInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitComment(file.id, authUser);
  });
}

// =====================
// LOAD COMMENTS
// =====================
async function loadComments(uploadId, authUser) {
  const { data: comments, error } = await supabaseClient
    .from("comments")
    .select("*")
    .eq("upload_id", uploadId)
    .order("created_at", { ascending: true });

  const list = document.getElementById("commentsList");
  list.innerHTML = "";

  if (error) { console.error(error); return; }
  if (!comments || comments.length === 0) {
    const empty = document.createElement("p");
    empty.style.color = "#444";
    empty.style.fontSize = "0.88em";
    empty.textContent = "No comments yet. Be the first!";
    list.appendChild(empty);
    return;
  }

  // Batch fetch user records for all commenters
  const uniqueIds = [...new Set(comments.map(c => c.user_id))];
  const { data: users } = await supabaseClient
    .from("users").select("id, username, profile_pic_url").in("id", uniqueIds);
  const userMap = {};
  (users || []).forEach(u => { userMap[u.id] = u; });

  comments.forEach((comment) => {
    const user = userMap[comment.user_id] || {};
    const item = document.createElement("div");
    item.className = "comment-item";

    // Avatar (small)
    const av = document.createElement(user.profile_pic_url ? "img" : "div");
    if (user.profile_pic_url) {
      av.src = user.profile_pic_url;
      av.className = "comment-avatar";
    } else {
      av.className = "comment-avatar-placeholder";
      av.textContent = "?";
    }
    item.appendChild(av);

    const body = document.createElement("div");
    body.className = "comment-body";

    const author = document.createElement("p");
    author.className = "comment-author";
    author.textContent = user.username || "Unknown";
    body.appendChild(author);

    const text = document.createElement("p");
    text.className = "comment-text";
    text.textContent = comment.content;
    body.appendChild(text);

    // Delete button (own comments only)
    if (authUser && authUser.id === comment.user_id) {
      const del = document.createElement("button");
      del.className = "comment-delete";
      del.textContent = "Delete";
      del.onclick = async () => {
        await supabaseClient.from("comments").delete().eq("id", comment.id);
        await loadComments(uploadId, authUser);
      };
      body.appendChild(del);
    }

    item.appendChild(body);
    list.appendChild(item);
  });
}

// =====================
// SUBMIT COMMENT
// =====================
async function submitComment(uploadId, authUser) {
  if (!authUser) return;
  const input = document.getElementById("commentInput");
  const content = input.value.trim();
  if (!content) return;

  const submitBtn = document.getElementById("commentSubmit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Posting...";

  const { error } = await supabaseClient.from("comments").insert({
    upload_id: uploadId,
    user_id:   authUser.id,
    content,
  });

  submitBtn.disabled = false;
  submitBtn.textContent = "Post";

  if (!error) {
    input.value = "";
    await loadComments(uploadId, authUser);
    // Scroll comments into view
    document.getElementById("commentsList").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// =====================
// LOAD RECOMMENDED
// =====================
async function loadRecommended(currentId) {
  const { data: uploads, error } = await supabaseClient
    .from("uploads")
    .select("*")
    .neq("id", currentId)
    .order("created_at", { ascending: false })
    .limit(15);

  const list = document.getElementById("recommendedList");
  list.innerHTML = "";

  if (error || !uploads || uploads.length === 0) {
    const empty = document.createElement("p");
    empty.style.color = "#444";
    empty.style.fontSize = "0.85em";
    empty.textContent = "No other videos yet.";
    list.appendChild(empty);
    return;
  }

  // Batch fetch uploaders
  const uniqueIds = [...new Set(uploads.map(u => u.user_id))];
  const { data: users } = await supabaseClient
    .from("users").select("id, username, profile_pic_url").in("id", uniqueIds);
  const userMap = {};
  (users || []).forEach(u => { userMap[u.id] = u; });

  uploads.forEach((file) => {
    const card = document.createElement("a");
    card.className = "rec-card";
    card.href = `/NightClips/watch.html?id=${file.id}`;

    // Thumbnail
    if (file.thumbnail_path) {
      const thumbUrl = supabaseClient.storage.from("public-files").getPublicUrl(file.thumbnail_path).data.publicUrl;
      const img = document.createElement("img");
      img.src = thumbUrl;
      img.className = "rec-thumb";
      img.alt = "";
      card.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "rec-thumb-placeholder";
      placeholder.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
      card.appendChild(placeholder);
    }

    // Info
    const info = document.createElement("div");
    info.className = "rec-info";

    const title = document.createElement("p");
    title.className = "rec-title";
    title.textContent = cleanTitle(file.title);
    info.appendChild(title);

    const user = userMap[file.user_id];
    if (user?.username) {
      const uname = document.createElement("p");
      uname.className = "rec-username";
      uname.textContent = user.username;
      info.appendChild(uname);
    }

    card.appendChild(info);
    list.appendChild(card);
  });
}

// =====================
// INIT
// =====================
loadVideo();
