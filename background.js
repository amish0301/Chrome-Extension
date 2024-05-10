// CONTEXT MENUS - CREATE
function createContextMenu() {
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

createContextMenu();

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

function createAlarms(name) {
  console.log("Alarm created", name);
}

// create context on Refresh
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});
