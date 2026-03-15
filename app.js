const { createClient } = supabase;

/* =====================
   SUPABASE CLIENT
===================== */

const supabaseClient = createClient(
"https://olyuzdwaeilrxvqfsgju.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seXV6ZHdhZWlscnh2cWZzZ2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjQ1ODAsImV4cCI6MjA4NjYwMDU4MH0.wVynFRV7IWKZwp3kl7PO6B5uWP535CoojZ9wVxcsJM4"
);

/* =====================
   SPLASH SCREEN
===================== */

window.addEventListener("load", () => {

const splash = document.getElementById("splash");

if(!splash) return;

setTimeout(() => {
splash.classList.add("hide");
},400);

setTimeout(() => {
splash.remove();
},900);

});

/* =====================
   REALTIME NEW VIDEO
===================== */

const banner = document.getElementById("newVideosBanner");

supabaseClient
.channel("uploads-watch")
.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"uploads"
},
(payload)=>{
console.log("New upload detected",payload);
if(banner) banner.style.display="flex";
}
)
.subscribe();


/* =====================
   BADGES DEFINITIONS
===================== */

const BADGES = [

{
id:"new",
text:"New",
subtitle:"Uploaded in last 24h",
image:"https://iili.io/qFOHXln.jpg",
condition:(uploads)=>{
const dayAgo = Date.now() - 86400000;

return uploads.some(
f => new Date(f.created_at).getTime() > dayAgo
);
}
},

{
id:"video",
text:"Video",
subtitle:"Uploaded a video",
image:"https://iili.io/qFOB4g2.jpg",
condition:(uploads)=>
uploads.some(
f => f.file_type && f.file_type.startsWith("video")
)
},

{
id:"mine",
text:"Present",
subtitle:"You've uploaded something!",
image:"https://iili.io/qFOBse9.webp",
condition:(uploads)=> uploads.length > 0
}

];


/* =====================
   ELEMENTS
===================== */

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


/* =====================
   USER HELPERS
===================== */

async function getUserRecord(userId){

const { data , error } = await supabaseClient
.from("users")
.select("*")
.eq("id",userId)
.single();

if(error){
console.error(error);
return null;
}

return data;

}

async function getUsernameById(userId){

const record = await getUserRecord(userId);

return record?.username || null;

}


/* =====================
   AUTH
===================== */

signupBtn.onclick = async ()=>{

authMessage.textContent="";

const username = usernameInput.value.trim();
const password = passwordInput.value;

if(!username || !password){
authMessage.textContent="Fill all fields";
return;
}

const email = `${username}@fake.local`;

const { data , error } = await supabaseClient.auth.signUp({
email,
password
});

if(error){
authMessage.textContent = error.message;
return;
}

await supabaseClient.from("users").insert({
id:data.user.id,
username
});

init();

};

loginBtn.onclick = async ()=>{

authMessage.textContent="";

const username = usernameInput.value.trim();
const password = passwordInput.value;

if(!username || !password){
authMessage.textContent="Fill all fields";
return;
}

const email = `${username}@fake.local`;

const { error } = await supabaseClient.auth.signInWithPassword({
email,
password
});

if(error){
authMessage.textContent = error.message;
}else{
init();
}

};


/* =====================
   BADGES RENDER
===================== */

function renderBadgesTab(earnedBadgeIds=[]){

const badgesList = document.getElementById("badgesList");

badgesList.innerHTML="";

BADGES.forEach(badge=>{

const card = document.createElement("div");
card.className="badge-card";

const img = document.createElement("img");
img.src = badge.image;

const title = document.createElement("div");
title.className="badge-title";
title.textContent = badge.text;

const subtitle = document.createElement("div");
subtitle.className="badge-subtitle";
subtitle.textContent = badge.subtitle;

const earned = earnedBadgeIds.includes(badge.id);

if(!earned){
card.style.opacity="0.4";
subtitle.textContent+=" (Locked)";
}

card.appendChild(img);
card.appendChild(title);
card.appendChild(subtitle);

badgesList.appendChild(card);

});

}


/* =====================
   INIT
===================== */

async function init(){

const { data } = await supabaseClient.auth.getUser();

if(!data.user){

authPage.style.display="flex";
dashboardPage.style.display="none";
return;

}

authPage.style.display="none";
dashboardPage.style.display="block";

userIdText.textContent = "#" + data.user.id.slice(0,7);

await loadProfile();
await loadGallery();
await loadLibrary();
await updateBadges();

}

init();


/* =====================
   TABS
===================== */

tabBtns.forEach(btn=>{

btn.onclick=()=>{

tabBtns.forEach(b=>b.classList.remove("active"));
tabContents.forEach(c=>c.style.display="none");

btn.classList.add("active");

document.getElementById(btn.dataset.tab).style.display="block";

};

});


/* =====================
   FILE INPUTS
===================== */

chooseVideoBtn.onclick = ()=> videoInput.click();
chooseThumbnailBtn.onclick = ()=> thumbnailInput.click();

videoInput.onchange = ()=>{
videoFileName.textContent = videoInput.files[0]?.name || "No video selected";
};

thumbnailInput.onchange = ()=>{
thumbnailFileName.textContent = thumbnailInput.files[0]?.name || "No thumbnail selected";
};


/* =====================
   PROFILE
===================== */

async function loadProfile(){

const { data } = await supabaseClient.auth.getUser();

if(!data.user) return;

const record = await getUserRecord(data.user.id);

if(!record) return;

editUsernameInput.value = record.username || "";

if(record.profile_pic_url){
profilePicPreview.src = record.profile_pic_url;
}

}

saveProfileBtn.onclick = async ()=>{

profileMessage.textContent="";

const { data } = await supabaseClient.auth.getUser();

if(!data.user){
profileMessage.textContent="Not logged in";
return;
}

const newUsername = editUsernameInput.value.trim();
const picFile = profilePicInput.files[0];

const updateData={};

if(newUsername){
updateData.username=newUsername;
}

if(picFile){

const path = `${data.user.id}/profile/${Date.now()}_${picFile.name}`;

const { error } = await supabaseClient.storage
.from("public-files")
.upload(path,picFile,{upsert:true});

if(error){
profileMessage.textContent="Upload failed";
return;
}

const { data:publicUrl } = supabaseClient.storage
.from("public-files")
.getPublicUrl(path);

updateData.profile_pic_url = publicUrl.publicUrl;

}

await supabaseClient
.from("users")
.update(updateData)
.eq("id",data.user.id);

profileMessage.textContent="Profile updated";

if(updateData.profile_pic_url){
profilePicPreview.src = updateData.profile_pic_url;
}

};


/* =====================
   VIDEO CARD
===================== */

function createVideoCardContent(url){

const container = document.createElement("div");

const vid = document.createElement("video");

vid.src=url;
vid.controls=true;
vid.className="custom-video";
vid.playsInline=true;

container.appendChild(vid);

return container;

}


/* =====================
   LOAD GALLERY
===================== */

async function loadGallery(){

const allVideos = document.getElementById("allVideos");

const { data:uploads } = await supabaseClient
.from("uploads")
.select("*")
.order("created_at",{ascending:false});

allVideos.innerHTML="";

const { data:authData } = await supabaseClient.auth.getUser();

uploads.forEach(file=>{

const url = supabaseClient.storage
.from("public-files")
.getPublicUrl(file.file_path).data.publicUrl;

const card = document.createElement("div");
card.className="card";
card.dataset.title = (file.title || "").toLowerCase();

if(file.thumbnail_path){

const thumbUrl = supabaseClient.storage
.from("public-files")
.getPublicUrl(file.thumbnail_path).data.publicUrl;

const img = document.createElement("img");

img.src=thumbUrl;
img.style.width="100%";

card.appendChild(img);

}else if(file.file_type.startsWith("video")){

card.appendChild(createVideoCardContent(url));

}

const title=document.createElement("p");
title.textContent=file.title;
title.style.fontWeight="bold";

card.appendChild(title);

const dl=document.createElement("a");
dl.href=url;
dl.textContent="Download";

card.appendChild(dl);

if(authData.user && authData.user.id===file.user_id){

const delBtn=document.createElement("button");

delBtn.textContent="Delete";

delBtn.onclick = async ()=>{

await supabaseClient.from("uploads").delete().eq("id",file.id);

await supabaseClient.storage
.from("public-files")
.remove([file.file_path]);

if(file.thumbnail_path){

await supabaseClient.storage
.from("public-files")
.remove([file.thumbnail_path]);

}

loadGallery();
loadLibrary();
updateBadges();

};

card.appendChild(delBtn);

}

allVideos.appendChild(card);

});

}


/* =====================
   LOAD LIBRARY
===================== */

async function loadLibrary(){

const userVideos = document.getElementById("userVideos");

userVideos.innerHTML="";

const { data } = await supabaseClient.auth.getUser();

if(!data.user) return;

const { data:uploads } = await supabaseClient
.from("uploads")
.select("*")
.eq("user_id",data.user.id)
.order("created_at",{ascending:false});

uploads.forEach(file=>{

const url = supabaseClient.storage
.from("public-files")
.getPublicUrl(file.file_path).data.publicUrl;

const card = document.createElement("div");
card.className="card";

card.appendChild(createVideoCardContent(url));

userVideos.appendChild(card);

});

}


/* =====================
   BADGE UPDATE
===================== */

async function updateBadges(){

const { data } = await supabaseClient.auth.getUser();

if(!data.user){
renderBadgesTab([]);
return;
}

const { data:uploads } = await supabaseClient
.from("uploads")
.select("*")
.eq("user_id",data.user.id);

const earned = BADGES
.filter(b => b.condition(uploads))
.map(b => b.id);

renderBadgesTab(earned);

}


/* =====================
   SEARCH
===================== */

function filterGallery(query){

const cards = document.querySelectorAll("#allVideos .card");

const q = query.toLowerCase();

cards.forEach(card=>{

const title = card.dataset.title || "";

card.style.display = title.includes(q) ? "flex" : "none";

});

}

document.getElementById("searchInput").addEventListener("input",function(){
filterGallery(this.value);
});


/* =====================
   SPACEBAR PLAY
===================== */

document.addEventListener("keydown",(e)=>{

if(e.code !== "Space") return;

const vid = document.querySelector("video");

if(!vid) return;

e.preventDefault();

if(vid.paused){
vid.play();
}else{
vid.pause();
}

});
