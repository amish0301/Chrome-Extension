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
      iconUrl:
        "https://upload.wikimedia.org/wikipedia/commons/f/f1/Draw_alarm-clock.png",
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
  return new Promise((resolve, reject) => {
    if (time === prevTimeOfWater)
      return reject(`Already created alarm for ${type}`);
    chrome.alarms.create(type, { periodInMinutes: time }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        prevTimeOfWater = time;
        console.log(`previous time of ${type} : ${prevTimeOfWater}`);
        resolve(`alarm created for ${type}`);
      }
    });
  });
}

async function stopAlarm(type) {
  return new Promise((resolve, reject) => {
    chrome.alarms.clear(type, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(`alarm cleared for ${type}`);
        console.log(`Alarm cleared for ${type}`);
      }
    });
  });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "water" && request.time) {
    try {
      await createAlarms({ time: request.time, type: "water" }).then(res => {
        sendResponse({ success: true, message: res });
        return true;
      }).catch(err => {
        sendResponse({ success: false, message: err });
        return false;
      })
    } catch (error) {
      sendResponse({
        success: false,
        message: "Error creating alarm: " + error.message,
      });
    }
  }

  if (request.type === "remove alarm for water") {
    await stopAlarm("water")
      .then((res) => {
        prevTimeOfWater = 0;
        sendResponse({ success: true, message: res });
        return true;
      })
      .catch((err) => {
        sendResponse({ success: false, message: err });
      });
  }
});

// create context menu
chrome.runtime.onInstalled.addListener(({ reason }) => {
  createContextMenu();
  if (reason === "install") {
    chrome.notifications.create({
      type: "basic",
      iconUrl:
        "https://cdn0.iconfinder.com/data/icons/apple-apps/100/Apple_Messages-512.png",
      title: "Your Reminder",
      message: "Thanks for installing this extension!🥰",
    });
  }
});
