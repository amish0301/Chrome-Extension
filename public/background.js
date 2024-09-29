// CONTEXT MENU - CREATE
function createContextMenu() {
  // Remove existing menu if it exists to prevent duplicate entries
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.log("Error clearing previous context menus", chrome.runtime.lastError);
    }
    
    // Create new context menu
    chrome.contextMenus.create(
      {
        id: "reminder",
        title: "Set Your Reminder",
        contexts: ["all"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.log("Error in creating context menu", chrome.runtime.lastError);
        } else {
          console.log("Context menu created successfully");

          // Store the menu item ID for later reference
          chrome.storage.local.set({ menuItemId: "reminder" }, () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error storing context menu ID: " + chrome.runtime.lastError.message
              );
            } else {
              console.log("Context menu ID stored");
            }
          });
        }
      }
    );
  });
}

// Listener for context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "reminder") {
    chrome.windows.create({
      url: chrome.runtime.getURL("./popup.html"), 
      type: "popup",
      width: 360,
      height: 500,
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "water") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "./assets/water_break.png",
      title: "Water Break",
      message: "Time to drink water!",
    });
  }

  if (alarm.name === "nap") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "break.png",
      title: "Break Time",
      message: "Time to take a Braek from Screen!",
    });
  }
});

async function createAlarms({ time, type, reset }) {
  return new Promise((resolve, reject) => {
    try {
      chrome.alarms.create(type, { periodInMinutes: time });

      if (!reset) {
        const update = {};
        if (type === "water") update.prevTimeOfWater = time;
        if (type === "nap") update.prevTimeOfNap = time;
        chrome.storage.sync.set(update);
      }

      console.log(`Previous time of ${type}: ${time}`);
      resolve(
        `Alarm created for ${type}. You'll be notified every ${time} minutes.`
      );
    } catch (error) {
      reject(`Error creating alarm for ${type}: ${error.message}`);
    }
  });
}

async function stopAlarm(type) {
  return new Promise((resolve, reject) => {
    chrome.alarms.clear(type, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const update = {};
        if (type === "water") update.prevTimeOfWater = -1;
        if (type === "nap") update.prevTimeOfNap = -1;
        chrome.storage.sync.set(update);

        resolve(`Alarm cleared for ${type}`);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handleAlarmCreation = async (type, time) => {
    try {
      const message = await createAlarms({ time, type, reset: false });
      sendResponse({ success: true, message });
    } catch (error) {
      sendResponse({ success: false, message: error });
    }
  };
  
  const handleAlarmRemoval = async (type) => {
    try {
      const message = await stopAlarm(type);
      sendResponse({ success: true, message });
    } catch (error) {
      sendResponse({ success: false, message: error });
    }
  };

  if (request.type === "water" && request.time) {
    handleAlarmCreation("water", request.time);
    return true;
  }

  if (request.type === "nap" && request.time) {
    handleAlarmCreation("nap", request.time);
    return true;
  }

  if (request.type === "remove alarm for water") {
    handleAlarmRemoval("water");
    return true;
  }

  if (request.type === "remove alarm for nap") {
    handleAlarmRemoval("nap");
    return true;
  }

  if (request.type === "successNotification") {
    try {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "https://cdn4.iconfinder.com/data/icons/buno-info-signs/32/__checkmark_success_ok-512.png",
        title: "Alertify",
        message: request.message,
      });
    } catch (error) {
      console.log("Error creating Success notification: " + error.message);
    }
    return true;
  }

  if (request.type === "errorNotification") {
    try {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678069-sign-error-256.png",
        title: "Error",
        message: request.message,
      });
      console.log("Error notification created");
    } catch (error) {
      console.log("Error creating Error notification: " + error.message);
    }
  }
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  createContextMenu();
  if (reason === "install") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "./assets/icon.png",
      title: "Alertify",
      message: "Thankyou For Installing Alertify!",
    });
  }
});

// on Suspend and onStartup
chrome.runtime.onSuspend.addListener(() => {
  chrome.alarms.clearAll();
});

chrome.runtime.onStartup.addListener(async () => {
  createContextMenu();
  const { prevTimeOfWater, prevTimeOfNap } = await chrome.storage.sync.get([
    "prevTimeOfWater",
    "prevTimeOfNap",
  ]);

  if (prevTimeOfWater > 0) {
    await createAlarms({ time: prevTimeOfWater, type: "water", reset: true });
  }

  if (prevTimeOfNap > 0) {
    await createAlarms({ time: prevTimeOfNap, type: "nap", reset: true });
  }
});
