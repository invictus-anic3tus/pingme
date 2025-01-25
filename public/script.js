// sidebar and root

const root = document.querySelector(":root");
const body = document.querySelector("body");
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const sidebarHeader = document.getElementById("sidebar-header");
const modeInd = document.getElementById("modeind");

const collapseBut = document.getElementById("collapse");
const collapseInd = document.getElementById("collapse-ind");
const tabs = document.querySelectorAll(".tab");
const miniTabs = document.getElementById("mini-tabs");
const about = document.getElementById("about");
const aboutpopup = document.getElementById("about-info");

const homeTab = document.getElementById("home-tab");
const pingsTab = document.getElementById("pings-tab");
const newTab = document.getElementById("add-ping-tab");
const settingsTab = document.getElementById("settings-tab");
const pingTemplate = document.getElementById("ping-template");

// misfits

const options = document.querySelectorAll(".options");
const optionsPopUp = document.querySelectorAll(".dot-options");

// Add ping tab:

const addPingName = document.getElementById("add-ping-name");
const addPingDesc = document.getElementById("add-ping-desc");
const addPingTime = document.getElementById("add-ping-time");
const addPingRepeats = document.getElementById("add-ping-repeats");
const addPingRptNum = document.getElementById("add-ping-repeat-number");
const addPingRptType = document.getElementById("add-ping-rpt");
const addPingButtons = document.getElementById("add-ping-buttons");

const addPingDone = addPingButtons.querySelector(".complete-yes");
const addPingClear = addPingButtons.querySelector(".delete-no");

// settings tab

const themeButtonsGrid = document.getElementById("settings-themes");
const themeButtons = themeButtonsGrid.querySelectorAll("button");
const colorModeSetting = document.getElementById('color-mode-setting');

// other stuff

let selectedTab = "home";

const pubVapidKey =
  "BPn0Ry5ZSfJJGxerDmCGGwVB75xBBCyHHTTyQaQWr2Gz244Ek12DSUs7kdimRYwcoPLjg0NCiVdIjAlfiBispqI";

var deletedIds;

populatePings("home");

const dateOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};

var pings = document.querySelectorAll(".ping");
var icons = document.querySelectorAll(".icon");

var editIcon = document.querySelectorAll(".edit");

const popup = document.getElementById("full-pop-up");

var darkS = localStorage.getItem("dark");
var dark = darkS === "true";

var darkBKG = "#222831";
var lightBKG = "#FFFFFF";
var lightSecondary = "#e6be74";
var darkSecondary = "#3A4750";
var lightHover = "#fdfdfd";
var darkHover = "#888888";
var fontColor = "#000000";
var darkFontColor = "#FFFFFF";

var collapsed = false;
var pingToAlter;

//**********Code to execute at beginning*************:

tabs.forEach((element) => {
  element.style.backgroundColor = "transparent";
  if (element.id == "home") {
    element.style.backgroundColor =
      getComputedStyle(root).getPropertyValue("--hover-color");
  }
});

setThemeButtonAppearances();
setTheme(localStorage.getItem("theme"), true);

hardSetColor();

for (let i = 0; i < pings.length; i++) {
  let pingID = pings[i].id;
  const compPingsContainer = document.getElementById(
    "home-completed-pings-container"
  );
  const pingsContainer = document.getElementById("home-pings-container");
  const completeBut = pings[i].querySelector(".complete-yes");

  if (localStorage.getItem(pingID + "-completed") === "true") {
    compPingsContainer.appendChild(pings[i]);

    completeBut.disabled = true;
    completeBut.style.cursor = "default";
    completeBut.style.filter = "grayscale(100%)";
  } else {
    pingsContainer.appendChild(pings[i]);
  }
}

about.addEventListener("mouseover", (event) => {
  aboutpopup.style.scale = "1";
});
about.addEventListener("mouseout", (event) => {
  aboutpopup.style.scale = "0";
});

let aptt = new Date();
let aptval = aptt.toISOString().slice(0, -7) + "00Z";
addPingTime.value = aptval;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service worker error:", error);
    });
}

Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    console.log("user allowed notifications");
  } else {
    alert("Hey! For this to work you kinda need to enable notifications.");
  }
});

if ("PushManager" in window) {
  navigator.serviceWorker.ready.then(async (registration) => {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(pubVapidKey),
    });

    for (let i = 0; i < pings.length; i++) {
      setupPing(pings[i], i);
      checkPingDate(pings[i]);
    }
  });
}


let deferredPrompt;
const downloadMobileButton = document.getElementById('download-mobile');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  downloadMobileButton.addEventListener('click', () => {
    deferredPrompt.prompt();
  });
});


setSettingsTab(undefined, "general", true);

//**********************Functions***************************//

// Notification functions:

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

async function notification(title, body, actions, tag) {
  const subscription = await navigator.serviceWorker.ready.then((sw) =>
    sw.pushManager.getSubscription()
  );
  if (!subscription) {
    console.error("no subscription :(");
    return;
  }
  // console.log(subscription);

  fetch("/api/send-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: subscription,
      title: title,
      message: body,
      actions: actions,
      tag: tag,
    }),
  }).then((response) => {
    if (response.ok) {
      console.log("Notification sent with custom actions!");
    } else {
      console.error("Failed to send notification:", response);
    }
  });
}

// const scheduleNotification = async (date, message, title, actions, tag) => {
//   await fetch("/api/schedule", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       date, // format: 2025-02-01T12:00:00Z
//       message,
//       title,
//       actions,
//       tag,
//     }),
//   });
//   console.log("Notification scheduled!");
// };

//**************Ping Functions****************//

// Ping notification functions:

function checkPingDate(obj) {
  let dateStr = obj.querySelector(".ping-date").innerText;
  let date = new Date(dateStr);

  if (localStorage.getItem(obj.id + "-completed") == "true") {
    return;
  }

  if (isPingNow(date)) {
    let actions = [
      { action: "complete", title: "Complete!" },
      { action: "delay", title: "Delay for a day" },
    ];
    let message =
      "Ping: '" + obj.querySelector(".ping-title").value + "' has pinged!";
    let rand = Math.floor(Math.random() * 10);
    let tag = "Ping '" + obj.querySelector(".ping-title").value + "'";
    notification(tag + " pinged!", message, actions, tag + "-id:" + rand);
  }
}

function addTimeToPing(ping, time) {
  let dateDisplay = ping.querySelector(".ping-date");
  let dateStr = dateDisplay.innerText;
  let date = new Date(dateStr);

  let newDate = addTimeToDate(date, time);

  formatDate = newDate.toLocaleString("en-US", dateOptions);
  dateDisplay.innerText = formatDate;

  localStorage.setItem(ping.id + "-next-ping", formatDate);
}

function isPingNow(date) {
  const today = new Date();

  return date < today;
}

function addTimeToDate(date, addedTime) {
  const timeUnits = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000, // 30 day months
    years: 365 * 24 * 60 * 60 * 1000, // 365 day years
  };

  const regex = /^(\d+)\s*(\w+)$/; // Match a number followed by a unit
  const match = addedTime.match(regex);

  const amount = parseInt(match[1], 10); // number
  const unit = match[2].toLowerCase(); //days,months, weeks ,years, etc.

  if (!timeUnits[unit]) {
    throw new Error(`Unsupported time unit: ${unit}`);
  }

  // Calculate the new timestamp for adding to the orig
  const addedMilliseconds = amount * timeUnits[unit];
  const newDate = new Date(date.getTime() + addedMilliseconds);

  return newDate;
}

// Ping button functions:

function completePing(obj, final) {
  if (final) {
    let doesRepeat = pingToAlter.querySelector(".does-repeat").checked;

    if (doesRepeat) {
      let addAmount =
        pingToAlter.querySelector(".repeat-num").value +
        " " +
        pingToAlter.querySelector(".repeat-type").value;
      addTimeToPing(pingToAlter, addAmount);
    } else {
      localStorage.setItem(pingToAlter.id + "-completed", "true");

      document
        .getElementById("home-completed-pings-container")
        .appendChild(pingToAlter);
    }

    popup.style.scale = "0";
  } else {
    pingToAlter = obj.parentElement.parentElement;

    let doesRepeat = pingToAlter.querySelector(".does-repeat").checked;

    let messageBody =
      "This will disable the ping until you resurrect it below.";

    if (doesRepeat) {
      messageBody =
        "Reminder: If you're completing this early, this ping will ping again the the amount of time you specified after the <i>DUE DATE</i>, not today.";
    }

    bodyPopUp(
      "Complete ping??",
      messageBody,
      "Yeah!",
      "never mind",
      "completePing(null, true)",
      'this.parentElement.parentElement.style.scale = "0";'
    );
  }
}

function delayPing(obj, final, amount) {
  if (final) {
    if (popup.querySelector(".delay-num").value < 1) {
      alert("Please delay a positive value :)");
      return;
    }
    addTimeToPing(pingToAlter, amount);
    popup.style.scale = "0";
    checkPingDate(pingToAlter);
  } else {
    let header =
      "Delay Ping " +
      obj.parentElement.parentElement.querySelector(".ping-title").innerText;
    let content = `<input type="number" class="delay-num" value="1" min="1">
<select name="repeat-type" class="delay-type">
<option value="hours">hours</option>
<option value="days">days</option>
<option value="weeks">weeks</option>
<option value="months">months</option>
<option value="years">years</option>
</select>`;

    let delayFunc =
      'delayPing(null, true, document.getElementById("full-pop-up").querySelector("p").querySelector(".delay-num").value + document.getElementById("full-pop-up").querySelector("p").querySelector(".delay-type").value)';
    bodyPopUp(
      header,
      content,
      "Delay",
      "Cancel",
      delayFunc,
      'this.parentElement.parentElement.style.scale = "0";'
    );
    pingToAlter = obj.parentElement.parentElement;
  }
}

function deletePing(obj, final) {
  if (final) {
    pingToAlter.style.display = "none";

    numPings = localStorage.getItem("how-many-pings");

    for (let i = parseInt(pingToAlter.id); i < parseInt(numPings); i++) {
      // console.log(i, pingToAlter.id);

      localStorage.setItem(
        i + "-title",
        localStorage.getItem(i + 1 + "-title")
      );
      localStorage.setItem(i + "-desc", localStorage.getItem(i + 1 + "-desc"));
      localStorage.setItem(
        i + "-does-repeat",
        localStorage.getItem(i + 1 + "-does-repeat")
      );
      localStorage.setItem(
        i + "-repeat-num",
        localStorage.getItem(i + 1 + "-repeat-num")
      );
      localStorage.setItem(
        i + "-next-ping",
        localStorage.getItem(i + 1 + "-next-ping")
      );
      localStorage.setItem(
        i + "-repeat-type",
        localStorage.getItem(i + 1 + "-repeat-type")
      );

      if (localStorage.getItem(i + "-title") == "null") {
        allLocalStorage(i + "-").forEach((storageItem) => {
          // console.log(i, storageItem.key + ': ' + storageItem.value);
          localStorage.removeItem(storageItem.key);
        });
      }
    }

    localStorage.setItem("how-many-pings", parseInt(numPings) - 1);

    numPings = localStorage.getItem("how-many-pings");

    popup.style.scale = "0";
  } else {
    let header =
      "Are you sure you want to delete ping " +
      obj.parentElement.parentElement.querySelector(".ping-title").value +
      "?";

    pingToAlter = obj.parentElement.parentElement;

    let content = "All deletions are final!";
    let act1 = 'this.parentElement.parentElement.style.scale = "0"';
    let act2 = "deletePing(pingToAlter, true)";

    bodyPopUp(header, content, "go back", "delete", act1, act2);
  }
}

// Ping setup functions:

function populatePings(tab) {
  numPings = localStorage.getItem("how-many-pings");

  if (!numPings || numPings == "0") {
    localStorage.setItem("how-many-pings", "0");
  } else {
    for (let i = 0; i < parseInt(numPings); i++) {
      const clone = pingTemplate.content.cloneNode(true);

      switch (tab) {
        case "home":
          addPingToScreen(clone);

          break;
        case "all":
          break;
        default:
          console.log("undefined tab selected");
          break;
      }
    }
  }
}

function setupPing(obj, index = 0, isNew = false) {
  obj.id = index;

  let title = obj.querySelector(".ping-title");
  let nextPing = obj.querySelector(".ping-date");
  let desc = obj.querySelector(".ping-desc");
  let repeatNumDisplay = obj.querySelector(".repeat-num-display");
  let repeatNum = obj.querySelector(".repeat-num");
  let repeatType = obj.querySelector(".repeat-type");
  let repeatTypeDisplay = obj.querySelector(".repeat-type-display");
  let doesRepeat = obj.querySelector(".does-repeat");

  // console.log(obj, title, nextPing, desc, doesRepeat, repeatNum, repeatType)

  if (
    localStorage.getItem(obj.id + "-title") &&
    localStorage.getItem(obj.id + "-desc")
  ) {
    title.value = localStorage.getItem(obj.id + "-title");
    desc.value = localStorage.getItem(obj.id + "-desc");
  }

  if (!localStorage.getItem(obj.id + "-title")) {
    localStorage.setItem(obj.id + "-title", title.value);
  }
  if (!localStorage.getItem(obj.id + "-next-ping")) {
    localStorage.setItem(obj.id + "-next-ping", nextPing.innerText);
  }
  if (!localStorage.getItem(obj.id + "-desc")) {
    localStorage.setItem(obj.id + "-desc", desc.value);
  }
  if (!localStorage.getItem(obj.id + "-does-repeat")) {
    localStorage.setItem(obj.id + "-does-repeat", doesRepeat.checked);
  }
  if (!localStorage.getItem(obj.id + "-repeat-num")) {
    localStorage.setItem(obj.id + "-repeat-num", repeatNum.value);
  }
  if (!localStorage.getItem(obj.id + "-repeat-type")) {
    localStorage.setItem(obj.id + "-repeat-type", repeatType.value);
  }

  nextPing.innerText = localStorage.getItem(obj.id + "-next-ping");

  fillEmptyText(obj);

  doesRepeat.checked = localStorage.getItem(obj.id + "-does-repeat") == "true";

  if (doesRepeat.checked == true) {
    repeatNumDisplay.innerText = localStorage.getItem(obj.id + "-repeat-num");
    repeatNum.value = repeatNumDisplay.innerText;

    repeatTypeDisplay.innerText = localStorage.getItem(obj.id + "-repeat-type");
    repeatType.value = repeatTypeDisplay.innerText;
  } else {
    obj.querySelector(".repeat-cont").style.display = "none";
  }
}

function addPingTabDone() {
  createPing(
    addPingName.value,
    addPingTime.value,
    addPingDesc.value,
    addPingRepeats.checked,
    addPingRptNum.value,
    addPingRptType.value
  );
  addPingTabClear();
}

function addPingTabClear() {
  addPingName.value = "";
  addPingTime.value = aptval;
  addPingDesc.value = "";
  addPingRepeats.checked = false;
  addPingRptNum.value = 1;
  addPingRptType.value = "Hours";
}

function createPing(
  name = "New Ping",
  date = "Jan 19, 2025, 3:00 PM",
  desc = "Ping Description",
  rpts = false,
  rptNum = 3,
  rptType = "hours"
) {
  console.log(name, date, desc, rpts, rptNum, rptType);

  const clone = pingTemplate.content.cloneNode(true);

  clone.querySelector(".ping-title").value = name;
  clone.querySelector(".ping-date").innerText = new Date(date).toLocaleString(
    "en-US",
    dateOptions
  );
  clone.querySelector(".ping-desc").value = desc;
  clone.querySelector(".repeat-num-display").innerText = rptNum;
  clone.querySelector(".repeat-num").value = rptNum;
  clone.querySelector(".repeat-type").value = rptType;
  clone.querySelector(".repeat-type-display").value = rptType;
  clone.querySelector(".does-repeat").checked = rpts;

  let htmlClone = document
    .getElementById("home-pings-container")
    .appendChild(clone);

  pings = document.querySelectorAll(".ping");
  icons = document.querySelectorAll(".icon");
  editIcon = document.querySelectorAll(".edit");

  for (let i = 0; i < pings.length; i++) {
    if (false) {
      // console.log("found ya");
    } else {
      setupPing(pings[i], i);
      checkPingDate(pings[i]);
    }
  }

  let numPings = parseInt(localStorage.getItem("how-many-pings"));

  numPings = numPings + 1;

  localStorage.setItem("how-many-pings", numPings);

  tab("home");

  // scheduleNotification(date, 'You can choose to delay it or complete it now.', name + ' has pinged!', [{'complete': 'Complete!'}, {'delay': 'Delay for a day'}], 'ping-' + name);
}

function addPingToScreen(clone) {
  let dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  let date1 = addTimeToDate(new Date(), "1 days");
  let date2 = date1.toLocaleString("en-US", dateOptions);

  clone.querySelector(".ping-date").innerText = date2;

  let htmlClone = document
    .getElementById("home-pings-container")
    .appendChild(clone);

  pings = document.querySelectorAll(".ping");
  icons = document.querySelectorAll(".icon");
  editIcon = document.querySelectorAll(".edit");

  for (let i = 0; i < pings.length; i++) {
    if (false) {
      // console.log("found ya");
    } else {
      setupPing(pings[i], i, false);
      checkPingDate(pings[i]);
    }
  }

  hardSetColor();
}

function editPing(obj) {
  let grampsDiv = obj.parentElement.parentElement;
  let title = obj.parentElement.querySelector(".ping-title");
  let desc = grampsDiv.querySelector(".ping-desc");
  let date = grampsDiv.querySelector(".ping-date");

  let repeatCont = grampsDiv.querySelector(".repeat-cont");
  let repeatNum = grampsDiv.querySelector(".repeat-num");
  let repeatType = grampsDiv.querySelector(".repeat-type");
  let repeatTypeDisplay = grampsDiv.querySelector(".repeat-type-display");
  let doesRepeat = grampsDiv.querySelector(".does-repeat");

  title.style.border = "2px solid gray";
  title.style.borderRadius = "5px";
  title.removeAttribute("readonly");
  title.style.cursor = "text";
  title.style.backgroundColor = "white";
  title.style.color = "black";
  title.setAttribute("spellcheck", "true");

  desc.style.border = "2px solid gray";
  desc.style.borderRadius = "5px";
  desc.removeAttribute("readonly");
  desc.style.cursor = "text";
  desc.style.backgroundColor = "white";
  desc.style.color = "black";
  desc.spellcheck = true;

  grampsDiv.querySelector(".does-repeat-label").style.display = "inline";
  doesRepeat.style.display = "inline";

  repeatCont.style.display = "block";
  repeatType.style.display = "inline";
  repeatTypeDisplay.style.display = "none";

  repeatNum.style.display = "inline";
  grampsDiv.querySelector(".repeat-num-display").style.display = "none";

  obj.src = "./images/Check.png";
  obj.style.marginTop = "1px";
  obj.setAttribute("onclick", "finishEditPing(this)");
}

function finishEditPing(obj) {
  let parentDiv = obj.parentElement;
  let grampsDiv = parentDiv.parentElement;
  let doesRepeat = grampsDiv.querySelector(".does-repeat");
  let doesRepeatVal = doesRepeat.checked;
  let repeatNum = grampsDiv.querySelector(".repeat-num");

  if (repeatNum.value < 1 && doesRepeatVal) {
    alert("Please repeat this ping a positive number :)");
    return;
  }

  let title = parentDiv.querySelector(".ping-title");
  let desc = grampsDiv.querySelector(".ping-desc");

  let repeatCont = grampsDiv.querySelector(".repeat-cont");
  let repeatNumDisplay = grampsDiv.querySelector(".repeat-num-display");
  let repeatType = grampsDiv.querySelector(".repeat-type");
  let repeatTypeDisplay = grampsDiv.querySelector(".repeat-type-display");

  title.style.border = "0";
  title.style.borderBottom = "2px solid var(--font-color)";
  title.style.borderRadius = "0";
  title.setAttribute("readonly", "");
  title.style.cursor = "default";
  title.style.backgroundColor = "transparent";
  title.style.color = "var(--font-color)";
  //title.setAttribute('spellcheck', 'false');
  title.spellcheck = false;

  desc.style.border = "0";
  desc.style.borderRadius = "0";
  desc.setAttribute("readonly", "");
  desc.style.cursor = "default";
  desc.style.backgroundColor = "transparent";
  desc.style.color = "var(--font-color)";
  desc.spellcheck = false;

  if (repeatNum.value.trim() == "") {
    repeatNum.value = 0;
  }

  if (doesRepeatVal) {
    repeatNumDisplay.innerText = repeatNum.value;
    repeatNum.style.display = "none";
    repeatNumDisplay.style.display = "inline";

    repeatTypeDisplay.innerText = repeatType.value;
    repeatType.style.display = "none";
    repeatTypeDisplay.style.display = "inline";
  } else {
    repeatCont.style.display = "none";
  }
  doesRepeat.style.display = "none";
  grampsDiv.querySelector(".does-repeat-label").style.display = "none";

  fillEmptyText(grampsDiv);

  localStorage.setItem(grampsDiv.id + "-title", title.value);
  localStorage.setItem(grampsDiv.id + "-desc", desc.value);

  localStorage.setItem(grampsDiv.id + "-does-repeat", doesRepeatVal);
  localStorage.setItem(grampsDiv.id + "-repeat-num", repeatNum.value);
  localStorage.setItem(grampsDiv.id + "-repeat-type", repeatType.value);

  obj.src = "./images/Edit.png";
  obj.style.marginTop = "initial";
  obj.setAttribute("onclick", "editPing(this)");
}

function fillEmptyText(obj) {
  let title = obj.querySelector(".ping-title");
  let desc = obj.querySelector(".ping-desc");

  if (title.value.trim() == "") {
    title.value = "My Ping";
  }
}

//***************UI functions***************//

function optionPopUp(num) {
  optionsPopUp[num].style.scale = "1";
}

function bodyPopUp(header, content, button1, button2, button1act, button2act) {
  let leftButton = popup.querySelector(".complete-yes");
  let rightButton = popup.querySelector(".delete-no");

  popup.querySelector("h1").innerText = header;
  popup.querySelector("p").innerHTML = content;
  leftButton.innerText = button1;
  rightButton.innerText = button2;

  leftButton.setAttribute("onclick", button1act);
  rightButton.setAttribute("onclick", button2act);

  popup.style.scale = "1";
}

function collapse() {
  sidebar.style.overflow = "hidden";

  if (!collapsed) {
    tabs.forEach((tab) => {
      let span = tab.querySelector("span");
      let img = tab.querySelector("img");

      if (span) {
        span.style.display = "none";
        tab.style.width = "fit-content";
      }
      if (img) {
        img.style.paddingRight = "0";
      }
    });

    sidebarHeader.querySelector("span").style.display = "none";
    sidebar.style.width = "80px";
    main.style.width = "calc(100% - 80px)";
    main.style.left = "80px";

    collapseInd.src = "./images/show_sidebar.png";
    // collapseBut.style.alignSelf = "flex-start";

    miniTabs.querySelector("#about").style.display = "none";

    sidebar.style.overflow = "auto";
    collapsed = true;
  } else {
    tabs.forEach((tab) => {
      let span = tab.querySelector("span");
      let img = tab.querySelector("img");

      if (span) {
        span.style.display = "inline";
        tab.style.width = "auto";
      }
      if (img) {
        img.style.paddingRight = "10px";
      }

      tab.style.marginBottom = "initial";
    });

    sidebarHeader.querySelector("span").style.display = "inline";
    sidebar.style.width = "200px";
    main.style.width = "calc(100% - 200px)";
    main.style.left = "200px";

    collapseInd.src = "./images/hide_sidebar.png";
    // collapseBut.style.alignSelf = "flex-end";

    miniTabs.querySelector("#about").style.display = "block";

    setTimeout(function () {
      sidebar.style.overflow = "auto";
    }, 0);

    collapsed = false;
  }
}

function tab(tab) {
  selectedTab = tab;

  tabs.forEach((element) => {
    element.style.backgroundColor = "transparent";
  });
  var tabobj = document.getElementById(tab);

  if (dark) {
    tabobj.style.backgroundColor = darkHover;
  } else {
    tabobj.style.backgroundColor = lightHover;
  }

  document.querySelectorAll(".main-tab").forEach((tab) => {
    tab.style.display = "none";
  });

  switch (tab) {
    case "home": // home-tab, pings-tab, add-ping-tab, settings-tab
      document.getElementById("home-tab").style.display = "block";
      break;
    case "my-pings":
      document.getElementById("pings-tab").style.display = "block";
      break;
    case "new":
      document.getElementById("add-ping-tab").style.display = "block";
      break;
    case "settings":
      document.getElementById("settings-tab").style.display = "block";
      break;
    default:
      break;
  }
}

function setSettingsTab(event, tab, overrides) {
  var i, tabContent, tabButtons;

  tabContent = document.getElementsByClassName("settings-content");

  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  tabButtons = document.querySelectorAll(".setting-tab-tab");
  for (i = 0; i < tabButtons.length; i++) {
    tabButtons[i].className = tabButtons[i].className.replace(" active", "");
  }

  document.getElementById("settings-" + tab).style.display = "block";

  if (overrides) {
    document.getElementById("setting-tab-general").className += " active";
  } else if (typeof event !== "undefined") {
    event.currentTarget.className += " active";
  }
}

function colorMode() {
  if (dark) {
    setLight();
    dark = false;
  } else {
    setDark();
    dark = true;
  }
  localStorage.setItem("dark", dark);
}

function setDark() {
  colorModeSetting.value = 'dark';
  
  updateRootThemeProperties(true);
  modeInd.src = "./images/light_mode.png";

  icons.forEach((icon) => {
    if ((icon.style.filter = "invert(0)")) {
      icon.style.filter = "invert(100%)";
    }
  });
  resetSelector();
}

function setLight() {
  colorModeSetting.value = 'light';

  updateRootThemeProperties(false);

  modeInd.src = "./images/dark_mode.png";

  icons.forEach((icon) => {
    if ((icon.style.filter = "invert(100%)")) {
      icon.style.filter = "invert(0)";
    }
  });
  resetSelector();
}

function updateRootThemeProperties(dark) {
  if (dark) {
    root.style.setProperty("--primary-color", darkBKG);
    root.style.setProperty("--hover-color", darkHover);
    root.style.setProperty("--secondary-color", darkSecondary);
    root.style.setProperty("--font-color", darkFontColor);
  } else {
    root.style.setProperty("--primary-color", lightBKG);
    root.style.setProperty("--hover-color", lightHover);
    root.style.setProperty("--secondary-color", lightSecondary);
    root.style.setProperty("--font-color", fontColor);
  }
}

function hardSetColor() {
  body.style.transitionDuration = "0s";
  sidebar.style.transitionDuration = "0s";

  icons.forEach((icon) => {
    icon.style.transitionDuration = "0s";
  });
  optionsPopUp.forEach((popup) => {
    popup.style.transitionDuration = "0s";
  });
  tabs.forEach((tab) => {
    tab.style.transitionDuration = "0s";
  });

  if (dark == true) {
    setDark();
  } else {
    setLight();
  }
  body.style.transitionDuration = "0.3s";
  sidebar.style.transitionDuration = "0.3s";

  icons.forEach((icon) => {
    icon.style.transitionDuration = "0.3s";
  });
  optionsPopUp.forEach((popup) => {
    popup.style.transitionDuration = "0.3s";
  });
  tabs.forEach((tab) => {
    tab.style.transitionDuration = "0.3s";
  });
}

function resetSelector() {
  document.querySelectorAll(".tab").forEach((element) => {
    if (element.style.backgroundColor != "transparent") {
      element.style.backgroundColor =
        getComputedStyle(root).getPropertyValue("--hover-color");
    } else {
      element.style.backgroundColor = "transparent";
    }
  });
}

function allLocalStorage(selector) {
  let storageItems = [];
  let returnItems = [];
  let sl = selector.length;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key);

    storageItems.push({
      key: key,
      value: val,
    });

    if (key.startsWith(selector)) {
      returnItems.push({
        key: key,
        value: val,
      });
    }
  }

  return returnItems;
}

function deleteAllData(final = false) {
  if (final) {
    localStorage.clear();

    popup.style.scale = "0";

    location.reload();
  } else {
    bodyPopUp(
      "Delete all data?",
      "This cannot be undone.",
      "return",
      "delete",
      'this.parentElement.parentElement.style.scale = "0"',
      "deleteAllData(true)"
    );
  }
}

//***********Settings functions****************/

function setThemeButtonAppearances() {
  themeButtons.forEach((button) => {
    button.style.border = "2px solid black";
    button.addEventListener("click", (ev) => {
      setTheme(button.id);
    });
  });
}


if (dark) {
  colorModeSetting.value = 'dark';
}
else {
  colorModeSetting.value = 'light';
}

colorModeSetting.addEventListener('change', ev => {
  if (colorModeSetting.value == 'dark') {
    localStorage.setItem('dark', 'true');
    setDark();
  }
  else {
    setLight();
    localStorage.setItem('dark', 'false');
  }
});

function setTheme(buttonTheme, inital) {
  let theme;

  if (inital) {
    theme = buttonTheme;
  } else {
    theme = buttonTheme.slice(6);
  }
  localStorage.setItem("theme", theme);

  // classic stark cool-blue aquamarine lush-green blinding colorful galaxy

  switch (theme) {
    case "classic":
      darkBKG = "#222831";
      lightBKG = "#FFFFFF";
      lightSecondary = "#e6be74";
      darkSecondary = "#3A4750";
      lightHover = "#fdfdfd";
      darkHover = "#888888";
      fontColor = "#000000";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
    case "stark":
      darkBKG = "#161616";
      lightBKG = "#FFFFFF";
      lightSecondary = "#e5e4e1";
      darkSecondary = "#282828";
      lightHover = "#c8c8c4";
      darkHover = "#434341";
      fontColor = "#000000";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
    case "cool-blue":
      darkBKG = "#1a1f3b";
      lightBKG = "#daeff5";
      lightSecondary = "#bff5ff";
      darkSecondary = "#2c3669";
      lightHover = "#8ce2fa";
      darkHover = "#2e5e9e";
      fontColor = "#000000";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
    case "aquamarine":
      darkBKG = "#013140";
      lightBKG = "#91d1ed";
      lightSecondary = "#99a8ff";
      darkSecondary = "#12334a";
      lightHover = "#8ce2fa";
      darkHover = "#2e5e9e";
      fontColor = "#000000";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
    case "lush-green":
      darkBKG = "#002b0b";
      lightBKG = "#afdb3d";
      lightSecondary = "#3ddb40";
      darkSecondary = "#115c11";
      lightHover = "#d7f7d8";
      darkHover = "#003301";
      fontColor = "#000000";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
    case "blinding":
      darkBKG = "#00ff11";
      lightBKG = "#ff0000";
      lightSecondary = "#00fff7";
      darkSecondary = "#ffdefc";
      lightHover = "#00ff84";
      darkHover = "#00eeff";
      fontColor = "#FFFFFF";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
    case "colorful":
      darkBKG = "#b328b8";
      lightBKG = "#e0d612";
      lightSecondary = "#12a2e0";
      darkSecondary = "#2c3669";
      lightHover = "#12e034";
      darkHover = "#ad2b36";
      fontColor = "#000000";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
    case "galaxy":
      darkBKG = "#211a3b";
      lightBKG = "#cca3f7";
      lightSecondary = "linear-gradient(#e314ce,rgb(225, 102, 230))";
      darkSecondary = "linear-gradient(#900ee7,rgb(34, 0, 31))";
      lightHover = "#b78af2";
      darkHover = "#3c018a";
      fontColor = "#000000";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
    default:
      darkBKG = "#222831";
      lightBKG = "#FFFFFF";
      lightSecondary = "#e6be74";
      darkSecondary = "#3A4750";
      lightHover = "#fdfdfd";
      darkHover = "#888888";
      fontColor = "#000000";
      darkFontColor = "#FFFFFF";
      updateRootThemeProperties(dark);
      break;
  }

  tabs.forEach((tab) => {
    if (tab.style.backgroundColor != "transparent") {
      if (dark) {
        tab.style.backgroundColor = darkHover;
      } else {
        tab.style.backgroundColor = lightHover;
      }
    }
  });

  themeButtons.forEach((button) => {
    button.style.border = "2px solid black";
    button.style.margin = "4px";
  });

  let selectedBut = document.getElementById("style-" + theme);
  selectedBut.style.border = "4px solid gold";
  selectedBut.style.margin = "2px";
}

