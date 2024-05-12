// CONTEXT MENUS - CREATE
let prevTimeOfWater = 0;
let prevTimeOfNap = 0;

function createContextMenu() {
  chrome.contextMenus.create(
    {
      id: "reminder",
      title: "Set Your Reminder",
      contexts: ["all"],
    },
    async () => {
      if (chrome.runtime.lastError) {
        console.log("Error in creating context menu", chrome.runtime.lastError);
      } else {
        chrome.storage.local.set({ menuItemId: "reminder" }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error storing context menu ID: " +
                chrome.runtime.lastError.message
            );
          } else {
            console.log("Context menu ID stored");
          }
        });
      }
    }
  );
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "reminder") {
    chrome.windows.create({
      url: "popup.html",
      type: "popup",
      width: 370,
      height: 325,
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "water") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Water Reminder",
      message: "Time to drink water!",
    });
  }

  if (alarm.name === "nap") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Nap Reminder",
      message: "Time to take a nap!",
    });
  }
});

async function createAlarms({ time, type }) {
  if (type === "water") {
    if (prevTimeOfWater === time) {
      return;
      // i can send message to the client
    }

    chrome.alarms.clear("water");
    // make new alarm
    await chrome.alarms.create(
      type,
      {
        delayInMinutes: time,
        periodInMinutes: time,
      },
      () => {
        if (chrome.runtime.lastError)
          console.log("Error in creating alarm", chrome.runtime.lastError);
        else prevTimeOfWater = time;
      }
    );
  }

  if (type === "nap") {
  }
}

function stopAlarm(type) {
  chrome.alarms.clear(type);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.time) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/1792/1792931.png",
      title: "Test",
      message: "Hey there!!",
    })
  }
});

// create context menu
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});
