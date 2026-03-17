const { createClient } = supabase;

const supabaseClient = createClient(
  "https://olyuzdwaeilrxvqfsgju.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seXV6ZHdhZWlscnh2cWZzZ2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjQ1ODAsImV4cCI6MjA4NjYwMDU4MH0.wVynFRV7IWKZwp3kl7PO6B5uWP535CoojZ9wVxcsJM4"
);

const params = new URLSearchParams(location.search);
const channelId = params.get("id");

function cleanTitle(t){ return (t||"").replace(/\s*\[.+\]\s*$/, "").trim(); }

function avatarNode(url){
  if (url){
    const img = document.createElement("img");
    img.className = "avatar";
    img.src = url;
    img.alt = "";
    return img;
  }
  const div = document.createElement("div");
  div.className = "avatarPh";
  div.textContent = "?";
  return div;
}

async function countViewsForUploads(uploadIds){
  if (uploadIds.length === 0) return {};
  const { data, error } = await supabaseClient
    .from("upload_views")
    .select("upload_id")
    .in("upload_id", uploadIds);

  if (error) return {};
  const map = {};
  (data||[]).forEach(v => { map[v.upload_id] = (map[v.upload_id]||0) + 1; });
  return map;
}

async function countLikesForUploads(uploadIds){
  if (uploadIds.length === 0) return {};
  const { data, error } = await supabaseClient
    .from("upload_reactions")
    .select("upload_id, value")
    .in("upload_id", uploadIds);

  if (error) return {};
  const map = {};
  (data||[]).forEach(r => {
    if (r.value === 1) map[r.upload_id] = (map[r.upload_id]||0) + 1;
  });
  return map;
}

function renderUploadCard(file, views=0, likes=0){
  const a = document.createElement("a");
  a.className = "card";
  a.href = `/NightClips/watch.html?id=${file.id}`;
  a.style.textDecoration = "none";
  a.style.color = "inherit";

  const thumbPath = file.thumbnail_path || file.file_path;
  const thumbUrl = supabaseClient.storage.from("public-files").getPublicUrl(thumbPath).data.publicUrl;

  const img = document.createElement("img");
  img.className = "thumb";
  img.src = thumbUrl;
  img.alt = "";
  if (file.file_type?.startsWith("image")) img.style.aspectRatio = "auto";
  a.appendChild(img);

  const t = document.createElement("p");
  t.className = "title";
  t.textContent = cleanTitle(file.title);
  a.appendChild(t);

  const meta = document.createElement("p");
  meta.className = "small";
  meta.textContent = `${views} view${views!==1?"s":""} · ${likes} like${likes!==1?"s":""}`;
  a.appendChild(meta);

  return a;
}

async function init(){
  if (!channelId){
    document.body.innerHTML = `<div style="padding:40px;color:#666;">No channel specified.</div>`;
    return;
  }

  const { data: user } = await supabaseClient
    .from("users").select("id, username, profile_pic_url, description")
    .eq("id", channelId).maybeSingle();

  if (!user){
    document.body.innerHTML = `<div style="padding:40px;color:#666;">Channel not found.</div>`;
    return;
  }

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

  if (error) {
    console.error(error);
    return;
  }

  const list = uploads || [];
  document.getElementById("uploadCount").textContent = String(list.length);

  const ids = list.map(u => u.id);
  const [viewsMap, likesMap] = await Promise.all([
    countViewsForUploads(ids),
    countLikesForUploads(ids),
  ]);

  const totalViews = ids.reduce((sum,id)=> sum + (viewsMap[id]||0), 0);
  document.getElementById("totalViews").textContent = String(totalViews);

  // Most viewed (top 1)
  const mostViewed = [...list].sort((a,b)=>(viewsMap[b.id]||0)-(viewsMap[a.id]||0)).slice(0,1);
  const mostViewedWrap = document.getElementById("mostViewed");
  mostViewedWrap.innerHTML = "";
  mostViewed.forEach(f => mostViewedWrap.appendChild(renderUploadCard(f, viewsMap[f.id]||0, likesMap[f.id]||0)));
  if (mostViewed.length === 0) mostViewedWrap.innerHTML = `<p style="color:#444;margin:0;">No uploads yet.</p>`;

  // Most liked (top 6)
  const mostLiked = [...list].sort((a,b)=>(likesMap[b.id]||0)-(likesMap[a.id]||0)).slice(0,6);
  const mostLikedWrap = document.getElementById("mostLiked");
  mostLikedWrap.innerHTML = "";
  mostLiked.forEach(f => mostLikedWrap.appendChild(renderUploadCard(f, viewsMap[f.id]||0, likesMap[f.id]||0)));
  if (mostLiked.length === 0) mostLikedWrap.innerHTML = `<p style="color:#444;margin:0;">No uploads yet.</p>`;

  // All uploads
  const allWrap = document.getElementById("allUploads");
  allWrap.innerHTML = "";
  list.forEach(f => allWrap.appendChild(renderUploadCard(f, viewsMap[f.id]||0, likesMap[f.id]||0)));
}

init();
