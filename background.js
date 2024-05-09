let isWater = document.getElementById("water_break");

// CONTEXT MENUS - CREATE
function createContextMenus() {
  chrome.contextMenus.create({
    id: "water",
    title: "Water Reminder",
    contexts: ["selction"],
  });
  chrome.contextMenus.create({
    id: "nap",
    title: "Nap Reminder",
    contexts: ["selection"],
  });
}

function createAlarms(name) {
  chrome.alarms.create("water", { periodInMinutes: 1 });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log("water :", isWater);
    // console.log(info);
})

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Installed Extension");
    createContextMenus();
  } else if (reason === chrome.runtime.OnInstalledReason.UPDATE) {
  }
});


/*

Checks needed:
1. if CREATED then check [contexts values]
2. Check isWater Value

*/