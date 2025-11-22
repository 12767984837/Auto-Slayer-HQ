// ---------------------------
// AUTO SLAYERS Command Hub
// script.js
// ---------------------------
//
// IMPORTANT: edit these values BELOW before using in production.
// Leave passwords blank for now and fill them later securely.
// MASTER_PASSWORD and ADMIN_PASSWORD are intentionally blank placeholders.

// ---------- SECURITY PLACEHOLDERS (EDIT THESE) ----------
const MASTER_PASSWORD = "Auto Slayers";   // <-- set team master password here (string)
const ADMIN_PASSWORD = "Moonshine";    // <-- set admin password if you want extra checks
// ----------------------------------------------------------------

// Predefined users (six members). Passwords intentionally blank -- fill values here.
let USERS = [
  { fullname: "Jyanshu", codename: "JG", role: "design engineer", password: "Jyanshu#123", disabled:false },
  { fullname: "Hridhaan", codename: "HA", role: "manufacturing engineerr", password: "Hridhaan#123", disabled:false },
  { fullname: "Aarav", codename: "AV", role: "sponsorship manager", password: "Aarav#123", disabled:false },
  { fullname: "Reyansh", codename: "RB", role: "team leader", password: "Reyansh#123", disabled:false },
  { fullname: "Bhavya", codename: "BK", role: "resource manager", password: "Bhavya#123", disabled:false },
  { fullname: "Suryansh", codename: "SG", role: "graphic designer", password: "Suryansh#123", disabled:false },
];

// LocalStorage keys
const LS_USERS = "autoslayer_users";
const LS_CHATS = "autoslayer_chats";
const LS_NOTES_PREFIX = "autoslayer_notes_"; // + codename
const LS_BOARDS = "autoslayer_boards";

// Utility: save initial users to localStorage if not present
function ensureUsers() {
  if(!localStorage.getItem(LS_USERS)){
    localStorage.setItem(LS_USERS, JSON.stringify(USERS));
  } else {
    // keep USERS in sync with local copy
    USERS = JSON.parse(localStorage.getItem(LS_USERS));
  }
}

// ---------- UI Element refs ----------
const logo = document.getElementById("logo");
const masterBox = document.getElementById("masterBox");
const masterInput = document.getElementById("masterInput");
const masterSubmit = document.getElementById("masterSubmit");
const masterCancel = document.getElementById("masterCancel");
const splash = document.getElementById("splash");
const splashName = document.getElementById("splashName");

const loginBox = document.getElementById("loginBox");
const loginSubmit = document.getElementById("loginSubmit");
const loginBack = document.getElementById("loginBack");
const fullnameInput = document.getElementById("fullname");
const codenameInput = document.getElementById("codename");
const roleInput = document.getElementById("role");
const userPwdInput = document.getElementById("userPwd");

const landing = document.getElementById("landing");
const dashboard = document.getElementById("dashboard");
const userGreeting = document.getElementById("userGreeting");

const navBtns = document.querySelectorAll(".navBtn");
const tabs = document.querySelectorAll(".tab");
const overrideHolder = document.getElementById("overrideHolder");
const manualOverrideBtn = document.getElementById("manualOverride");

const membersList = document.getElementById("membersList");
const adminPanel = document.getElementById("adminPanel");
const banList = document.getElementById("banList");
const wipeAllBtn = document.getElementById("wipeAll");
const clearGroupChatsBtn = document.getElementById("clearGroupChats");

const boardsContainer = document.getElementById("boardsContainer");
const personalNotes = document.getElementById("personalNotes");
const saveNotesBtn = document.getElementById("saveNotes");
const clearNotesBtn = document.getElementById("clearNotes");

const userListDiv = document.getElementById("userList");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendMsgBtn = document.getElementById("sendMsg");
const convButtons = document.querySelectorAll(".convBtn");
const convTitle = document.getElementById("convTitle");

const carStatusEl = document.getElementById("carStatus");
const rpmDisplay = document.getElementById("rpmDisplay");
const wifiStatus = document.getElementById("wifiStatus");
const simRPM = document.getElementById("simRPM");
const simStop = document.getElementById("simStop");

const clearChatLocalBtn = document.getElementById("clearChatLocal");

// ----------------- state -----------------
let pressTimer = null;
let loggedInUser = null;
let currentConversation = "group"; // "group" or "user:<codename>"
ensureUsers();

// ----------------- Long press on logo -----------------
logo.addEventListener("mousedown", ()=> {
  pressTimer = setTimeout(()=> {
    // show master input
    showSection(masterBox);
  }, 1000 * 3); // 3 seconds
});
logo.addEventListener("mouseup", ()=> {
  if(pressTimer) clearTimeout(pressTimer);
});
logo.addEventListener("touchstart", ()=> {
  pressTimer = setTimeout(()=> showSection(masterBox), 3000);
});
logo.addEventListener("touchend", ()=> clearTimeout(pressTimer));

masterCancel.onclick = ()=> {
  hideSection(masterBox);
}

// MASTER password handling
masterSubmit.onclick = ()=> {
  if(MASTER_PASSWORD === "") {
    alert("Master password placeholder is blank. Please open script.js and set MASTER_PASSWORD before using this demo.");
    return;
  }
  const v = masterInput.value.trim();
  if(v === MASTER_PASSWORD) {
    hideSection(masterBox);
    showSplashThenLogin();
  } else {
    alert("Wrong master password.");
  }
};

function showSplashThenLogin(){
  showSection(splash);
  splashName.innerText = "Welcome Slayer";
  setTimeout(()=> {
    hideSection(splash);
    showSection(loginBox);
  }, 3000);
}

// ----------------- Login flow -----------------
loginBack.onclick = ()=> {
  hideSection(loginBox);
  showSection(landing);
}

loginSubmit.onclick = ()=> {
  const fullname = fullnameInput.value.trim();
  const codename = codenameInput.value.trim();
  const role = roleInput.value.trim();
  const pwd = userPwdInput.value;

  if(!fullname || !codename || !role) { alert("Enter full name, code name and role"); return; }

  // read users from storage
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  const match = users.find(u=> u.fullname === fullname && u.codename === codename);
  if(!match) { alert("No matching user found. Please check name/code name."); return; }
  if(match.disabled) { alert("This account is disabled. Contact admin."); return; }
  // If password blank in code, instruct user to set it
  if(match.password === "") {
    alert("This user's password has not been set in the site backend. Admin should set the password in script.js or localStorage users.");
    return;
  }
  if(match.password !== pwd) { alert("Incorrect password"); return; }

  // success
  loggedInUser = match;
  localStorage.setItem("autoslayer_loggedIn", JSON.stringify(loggedInUser));
  hideSection(loginBox);
  showDashboardForUser();
};

// ----------------- Dashboard & UI helpers -----------------
function showDashboardForUser(){
  landing.classList.add("hidden");
  dashboard.classList.remove("hidden");
  userGreeting.innerText = `${loggedInUser.fullname} – ${loggedInUser.codename} (${loggedInUser.role})`;

  // show override only for admin identity
  if(loggedInUser.fullname === "Jyanshu") {
    overrideHolder.classList.remove("hidden");
    adminPanel.classList.remove("hidden");
  } else {
    overrideHolder.classList.add("hidden");
    adminPanel.classList.add("hidden");
  }

  refreshMembersList();
  refreshBoards();
  loadPersonalNotes();
  renderUserListForChat();
  loadConversation("group");
}

document.getElementById("logout").onclick = ()=> {
  localStorage.removeItem("autoslayer_loggedIn");
  loggedInUser = null;
  dashboard.classList.add("hidden");
  landing.classList.remove("hidden");
  // clear inputs
  fullnameInput.value = codenameInput.value = roleInput.value = userPwdInput.value = "";
}

// navigation
navBtns.forEach(b=>{
  b.addEventListener("click", ()=>{
    navBtns.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    const tab = b.dataset.tab;
    tabs.forEach(t=> t.classList.add("hidden"));
    document.getElementById(tab).classList.remove("hidden");
  })
});

// ----------------- Bulletin boards -----------------
function refreshBoards(){
  // load boards or create default
  let boards = JSON.parse(localStorage.getItem(LS_BOARDS) || "{}");
  // ensure board for each user
  const users = JSON.parse(localStorage.getItem(LS_USERS));
  users.forEach(u=>{
    if(!boards[u.codename]) boards[u.codename] = {title: u.codename, notes: `Bulletin board for ${u.codename}`};
  });
  localStorage.setItem(LS_BOARDS, JSON.stringify(boards));

  boardsContainer.innerHTML = "";
  for(const key in boards){
    const b = boards[key];
    const el = document.createElement("div");
    el.className = "boardCard";
    el.innerHTML = `<h4>${b.title}</h4><textarea data-board="${key}" class="boardText">${b.notes}</textarea>
      <div class="row"><button data-save="${key}">Save</button></div>`;
    boardsContainer.appendChild(el);
  }

  // bind save buttons
  boardsContainer.querySelectorAll("[data-save]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const k = btn.getAttribute("data-save");
      const ta = boardsContainer.querySelector(`textarea[data-board="${k}"]`);
      boards[k].notes = ta.value;
      localStorage.setItem(LS_BOARDS, JSON.stringify(boards));
      alert("Saved.");
    })
  });
}

// ----------------- Notes (personal) -----------------
function loadPersonalNotes(){
  const key = LS_NOTES_PREFIX + loggedInUser.codename;
  personalNotes.value = localStorage.getItem(key) || "";
}
saveNotesBtn.onclick = ()=> {
  const key = LS_NOTES_PREFIX + loggedInUser.codename;
  localStorage.setItem(key, personalNotes.value);
  alert("Notes saved locally.");
}
clearNotesBtn.onclick = ()=> {
  personalNotes.value = "";
  const key = LS_NOTES_PREFIX + loggedInUser.codename;
  localStorage.removeItem(key);
  alert("Notes cleared.");
}

// ----------------- Chat (group + private) -----------------
function getChats(){
  return JSON.parse(localStorage.getItem(LS_CHATS) || "{}");
}
function saveChats(chats){ localStorage.setItem(LS_CHATS, JSON.stringify(chats)); }

function renderUserListForChat(){
  const users = JSON.parse(localStorage.getItem(LS_USERS));
  userListDiv.innerHTML = "";
  users.forEach(u=>{
    const btn = document.createElement("button");
    btn.className = "convBtn";
    btn.textContent = `${u.codename} (${u.fullname})`;
    btn.dataset.conv = `user:${u.codename}`;
    btn.addEventListener("click", ()=> loadConversation(btn.dataset.conv));
    userListDiv.appendChild(btn);
  });
  // mark group active
  document.querySelectorAll(".convBtn").forEach(b=>{
    b.classList.remove("active");
    if(b.dataset.conv === "group") b.classList.add("active");
  });
}

function addMessage(convId, senderCodename, senderFull, text){
  const chats = getChats();
  if(!chats[convId]) chats[convId] = [];
  chats[convId].push({from: senderCodename, name: senderFull, text, ts: Date.now()});
  saveChats(chats);
  if(currentConversation === convId) renderMessages(convId);
}

sendMsgBtn.onclick = ()=> {
  const text = messageInput.value.trim();
  if(!text) return;
  addMessage(currentConversation, loggedInUser.codename, loggedInUser.fullname, text);
  messageInput.value = "";
}

function renderMessages(convId){
  currentConversation = convId;
  convTitle.innerText = (convId === "group") ? "Group Chat" : `Private: ${convId.split(":")[1]}`;
  // mark active conv button
  document.querySelectorAll(".convBtn").forEach(b=> {
    b.classList.remove("active");
    if(b.dataset.conv === convId) b.classList.add("active");
  });

  const chats = getChats();
  const list = chats[convId] || [];
  messagesDiv.innerHTML = "";
  list.forEach(m=>{
    const d = document.createElement("div");
    d.className = "msg";
    if(m.from === loggedInUser.codename) d.classList.add("you");
    d.innerHTML = `<div style="font-size:12px;color:var(--muted)">${m.name} • ${new Date(m.ts).toLocaleTimeString()}</div>
                   <div>${escapeHtml(m.text)}</div>`;
    messagesDiv.appendChild(d);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function loadConversation(convId){
  renderMessages(convId);
}

// clear local chat for current conv
clearChatLocalBtn.onclick = ()=> {
  const chats = getChats();
  chats[currentConversation] = [];
  saveChats(chats);
  renderMessages(currentConversation);
}

// helper
function escapeHtml(s){ return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

// ----------------- Members list & admin ban UI --------------
function refreshMembersList(){
  const users = JSON.parse(localStorage.getItem(LS_USERS));
  membersList.innerHTML = "";
  banList.innerHTML = "";
  users.forEach(u=>{
    const div = document.createElement("div");
    div.className = "membersItem";
    div.innerHTML = `<div><strong>${u.fullname}</strong> (${u.codename})<br><small>${u.role}</small></div>
                     <div><small>${u.disabled ? "<span style='color:#f55'>BANNED</span>" : "<span style='color:#9f9'>Active</span>"}</small></div>`;
    membersList.appendChild(div);

    // ban controls (admin view)
    const bdiv = document.createElement("div");
    bdiv.style.display = "flex"; bdiv.style.gap = "6px"; bdiv.style.alignItems = "center";
    const banBtn = document.createElement("button");
    banBtn.textContent = u.disabled ? "Unban" : "Ban";
    banBtn.addEventListener("click", ()=> {
      if(!confirm(`Confirm ${u.disabled ? "unban":"ban"} ${u.fullname}?`)) return;
      u.disabled = !u.disabled;
      // update local storage
      const all = JSON.parse(localStorage.getItem(LS_USERS));
      const idx = all.findIndex(x=> x.codename === u.codename);
      all[idx].disabled = u.disabled;
      localStorage.setItem(LS_USERS, JSON.stringify(all));
      refreshMembersList();
    });
    bdiv.appendChild(banBtn);
    banList.appendChild(bdiv);
  });
}

// ----------------- Admin wipe and clear
wipeAllBtn.onclick = ()=> {
  if(!confirm("Are you 100% sure? This will wipe ALL local team data (chats, boards, notes, users). This action is irreversible.")) return;
  localStorage.clear();
  alert("All local data cleared. Reloading page.");
  location.reload();
};
clearGroupChatsBtn.onclick = ()=> {
  const chats = getChats();
  chats["group"] = [];
  saveChats(chats);
  loadConversation("group");
  alert("Group chat cleared locally.");
};

// ----------------- Simulate RPM and stop
simRPM.onclick = ()=> {
  const v = Math.floor(Math.random()*800 + 200);
  rpmDisplay.innerText = v + " rpm";
  carStatusEl.innerText = "Running";
  addMessage("group","SYSTEM","SYSTEM",`RPM updated: ${v}`);
};
simStop.onclick = ()=> {
  rpmDisplay.innerText = "0";
  carStatusEl.innerText = "Stopped";
  addMessage("group","SYSTEM","SYSTEM","Treadmill stopped");
};

// ----------------- Manual override visible only for admin user
manualOverrideBtn.addEventListener("click", ()=> {
  // Admin-only override actions: show dialog with options
  const a = prompt("Admin Manual Override menu:\nType option: STOPCAR | LOCKSITE | CLEARCHATS\n\nType option:");
  if(!a) return;
  const cmd = a.trim().toUpperCase();
  if(cmd === "STOPCAR") {
    carStatusEl.innerText = "FORCED STOP (admin)";
    rpmDisplay.innerText = "0";
    addMessage("group","ADMIN","ADMIN","Admin forced car stop");
    alert("Car stopped (simulated).");
  } else if(cmd === "LOCKSITE"){
    if(!confirm("This will instruct a full site lock — only reflash can reset. Proceed?")) return;
    // Simulated lock: clear logged in user and set a flag
    localStorage.setItem("autoslayer_site_locked", "1");
    alert("Site flagged as locked. To 'unlock' you must clear localStorage key autoslayer_site_locked manually or re-upload code that removes this.");
  } else if(cmd === "CLEARCHATS"){
    if(!confirm("Clear all chat history?")) return;
    localStorage.removeItem(LS_CHATS);
    alert("All chat history cleared (local).");
    renderUserListForChat();
    loadConversation("group");
  } else {
    alert("Unknown admin command.");
  }
});

// ----------------- On load: restore login if any
window.addEventListener("load", ()=> {
  ensureUsers();
  // check site locked flag
  if(localStorage.getItem("autoslayer_site_locked")){
    alert("Site is locked. Admin intervention required (clear autoslayer_site_locked in localStorage).");
    return;
  }
  const logged = localStorage.getItem("autoslayer_loggedIn");
  if(logged){
    loggedInUser = JSON.parse(logged);
    showDashboardForUser();
  } else {
    // show landing
    landing.classList.remove("hidden");
  }
});

// ----------------- helper for showing/hiding "screens"
function showSection(el){ el.classList.remove("hidden"); }
function hideSection(el){ el.classList.add("hidden"); }