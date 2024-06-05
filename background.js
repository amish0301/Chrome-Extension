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
        "https://play-lh.googleusercontent.com/TWlBpj9QhhNqXKAzwREIPQUFVlH84Y0tOknUZIxgEZ4L1TgyI-veLvXC8-bYYDxgIafb",
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
    if (time === prevTimeOfWater) reject(`Already created alarm for ${type}`);
    chrome.alarms.create(type, { periodInMinutes: time }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        prevTimeOfWater = time;
        console.log(`previous time of ${type} : ${prevTimeOfWater}`);
        resolve(
          `Alarm is Created for ${type} and You'll be notified in every ${time} minutes`
        );
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
        resolve(`Alarm is Cleared for ${type}`);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "water" && request.time) {
    try {
      createAlarms({ time: request.time, type: "water" })
        .then((res) => {
          sendResponse({ success: true, message: res });
        })
        .catch((err) => {
          sendResponse({ success: false, message: err });
        });
      return true;
    } catch (error) {
      sendResponse({
        success: false,
        message: "Error creating alarm: " + error.message,
      });
    }
  } else if (request.type === "remove alarm for water") {
    stopAlarm("water")
      .then((res) => {
        prevTimeOfWater = 0;
        sendResponse({ success: true, message: res });
      })
      .catch((err) => {
        sendResponse({ success: false, message: err });
      });

    return true;
  } else if (request.type === "successNotification") {
    try {
      chrome.notifications.create({
        type: "basic",
        iconUrl:
          "https://cdn4.iconfinder.com/data/icons/buno-info-signs/32/__checkmark_success_ok-512.png",
        title: "Notification",
        message: request.message,
      });
    } catch (error) {
      console.log("Error creating Success notification: " + error.message);
    }
    return true;
  }
  else if (request.type === "errorNotification") {
    try {
      chrome.notifications.create({
        type: "basic",
        iconUrl:
          "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678069-sign-error-256.png",
        title: "Error",
        message: request.message,
      });
      console.log("Error notification created");
    } catch (error) {
      console.log("Error creating Error notification: " + error.message);
    }
  }
});

// create context menu
chrome.runtime.onInstalled.addListener(({ reason }) => {
  createContextMenu();
  if (reason === "install") {
    chrome.notifications.create({
      type: "basic",
      iconUrl:
        "icon.png",
      title: "Alertify",
      message: "Thankyou For Installing Alertify!",
    });
  }
});