const { createClient } = supabase;

const supabaseClient = createClient(
  "https://olyuzdwaeilrxvqfsgju.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seXV6ZHdhZWlscnh2cWZzZ2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjQ1ODAsImV4cCI6MjA4NjYwMDU4MH0.wVynFRV7IWKZwp3kl7PO6B5uWP535CoojZ9wVxcsJM4"
);

const params    = new URLSearchParams(location.search);
const channelId = params.get("id");

function cleanTitle(t) { return (t || "").replace(/\s*\[.+\]\s*$/, "").trim(); }

function avatarNode(url) {
  if (url) {
    const img = document.createElement("img");
    img.className = "chan-avatar";
    img.src = url;
    img.alt = "";
    return img;
  }
  const div = document.createElement("div");
  div.className = "chan-avatar-ph";
  div.textContent = "?";
  return div;
}

async function countViewsForUploads(uploadIds) {
  if (uploadIds.length === 0) return {};
  const { data, error } = await supabaseClient
    .from("upload_views")
    .select("upload_id")
    .in("upload_id", uploadIds);
  if (error) return {};
  const map = {};
  (data || []).forEach(v => { map[v.upload_id] = (map[v.upload_id] || 0) + 1; });
  return map;
}

async function countLikesForUploads(uploadIds) {
  if (uploadIds.length === 0) return {};
  const { data, error } = await supabaseClient
    .from("upload_reactions")
    .select("upload_id, value")
    .in("upload_id", uploadIds);
  if (error) return {};
  const map = {};
  (data || []).forEach(r => {
    if (r.value === 1) map[r.upload_id] = (map[r.upload_id] || 0) + 1;
  });
  return map;
}

// Renders a card matching the gallery style exactly
function renderUploadCard(file, views = 0, likes = 0) {
  const card = document.createElement("div");
  card.className = "card";

  // Clickable thumbnail area
  const mediaLink = document.createElement("a");
  mediaLink.href = `/NightClips/watch.html?id=${file.id}`;
  mediaLink.className = "card-media-link";

  const isImage = file.file_type && file.file_type.startsWith("image");
  const thumbPath = file.thumbnail_path || file.file_path;
  const thumbUrl  = supabaseClient.storage.from("public-files").getPublicUrl(thumbPath).data.publicUrl;

  const img = document.createElement("img");
  img.src = thumbUrl;
  img.className = "card-thumb";
  img.alt = "";
  if (isImage) img.style.aspectRatio = "auto";
  mediaLink.appendChild(img);
  card.appendChild(mediaLink);

  // Title + meta row
  const titleRow = document.createElement("div");
  titleRow.className = "card-title-row";
  titleRow.style.cursor = "pointer";
  titleRow.onclick = () => { window.location.href = `/NightClips/watch.html?id=${file.id}`; };

  const textWrap = document.createElement("div");
  textWrap.className = "card-title-text";

  const titleEl = document.createElement("p");
  titleEl.className = "vid-title";
  titleEl.textContent = cleanTitle(file.title);
  textWrap.appendChild(titleEl);

  // views · likes sub-line
  const meta = document.createElement("p");
  meta.className = "vid-uploader";
  meta.textContent = `${views} view${views !== 1 ? "s" : ""} · ${likes} like${likes !== 1 ? "s" : ""}`;
  textWrap.appendChild(meta);

  titleRow.appendChild(textWrap);
  card.appendChild(titleRow);

  return card;
}

async function init() {
  if (!channelId) {
    document.body.innerHTML = `<div style="padding:40px;color:#666;">No channel specified.</div>`;
    return;
  }

  const { data: user } = await supabaseClient
    .from("users").select("id, username, profile_pic_url, description")
    .eq("id", channelId).maybeSingle();

  if (!user) {
    document.body.innerHTML = `<div style="padding:40px;color:#666;">Channel not found.</div>`;
    return;
  }

  document.title = (user.username || "Channel") + " · NightClips";
  document.getElementById("chanName").textContent = user.username || "Unknown";
  document.getElementById("chanDesc").textContent = user.description || "";

  const avWrap = document.getElementById("chanAvatar");
  avWrap.innerHTML = "";
  avWrap.appendChild(avatarNode(user.profile_pic_url));

  const { data: uploads, error } = await supabaseClient
    .from("uploads")
    .select("*")
    .eq("user_id", channelId)
    .order("created_at", { ascending: false });

  if (error) { console.error(error); return; }

  const list = uploads || [];
  document.getElementById("uploadCount").textContent = String(list.length);

  const ids = list.map(u => u.id);
  const [viewsMap, likesMap] = await Promise.all([
    countViewsForUploads(ids),
    countLikesForUploads(ids),
  ]);

  const totalViews = ids.reduce((sum, id) => sum + (viewsMap[id] || 0), 0);
  document.getElementById("totalViews").textContent = String(totalViews);

  // Most viewed (top 1)
  const mostViewed     = [...list].sort((a, b) => (viewsMap[b.id] || 0) - (viewsMap[a.id] || 0)).slice(0, 1);
  const mostViewedWrap = document.getElementById("mostViewed");
  mostViewedWrap.innerHTML = "";
  if (mostViewed.length === 0) {
    mostViewedWrap.innerHTML = `<p class="empty-msg">No uploads yet.</p>`;
  } else {
    mostViewed.forEach(f => mostViewedWrap.appendChild(renderUploadCard(f, viewsMap[f.id] || 0, likesMap[f.id] || 0)));
  }

  // Most liked (top 6)
  const mostLiked     = [...list].sort((a, b) => (likesMap[b.id] || 0) - (likesMap[a.id] || 0)).slice(0, 6);
  const mostLikedWrap = document.getElementById("mostLiked");
  mostLikedWrap.innerHTML = "";
  if (mostLiked.length === 0) {
    mostLikedWrap.innerHTML = `<p class="empty-msg">No uploads yet.</p>`;
  } else {
    mostLiked.forEach(f => mostLikedWrap.appendChild(renderUploadCard(f, viewsMap[f.id] || 0, likesMap[f.id] || 0)));
  }

  // All uploads
  const allWrap = document.getElementById("allUploads");
  allWrap.innerHTML = "";
  if (list.length === 0) {
    allWrap.innerHTML = `<p class="empty-msg">No uploads yet.</p>`;
  } else {
    list.forEach(f => allWrap.appendChild(renderUploadCard(f, viewsMap[f.id] || 0, likesMap[f.id] || 0)));
  }
}

init();
