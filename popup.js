const nap_break_input = document.getElementById("nap_break");
const water_break_input = document.getElementById("water_break");

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["isWaterChecked"]).then((result) => {
    water_break_input.checked = result.isWaterChecked || false;
  }).catch((err) => {
    console.log('Error in storage');
  });

  water_break_input.addEventListener("change", function () {
    if (water_break_input.checked) {
      document.getElementsByClassName("expand_water")[0].style.display =
        "block";
    } else {
      document.getElementsByClassName("expand_water")[0].style.display = "none";
    }

    chrome.storage.sync.set({ isWaterChecked: water_break_input.checked });
  });
});

nap_break_input.addEventListener("change", function () {
  if (nap_break_input.checked) {
    document.getElementsByClassName("expand_nap")[0].style.display = "block";
  } else {
    document.getElementsByClassName("expand_nap")[0].style.display = "none";
  }
});

const collapseBtn = document.getElementsByClassName("collapsible")[0];
collapseBtn.addEventListener("click", function () {
  // this.classList.toggle("active");
  const water_content = document.getElementsByClassName("water_content")[0];
  if (water_content.style.display === "block") {
    water_content.style.display = "none";
  } else {
    water_content.style.display = "block";
  }
});

const collapseBtn2 = document.getElementsByClassName("collapsible2")[0];
collapseBtn2.addEventListener("click", function () {
  // this.classList.toggle("active");
  const nap_content = document.getElementsByClassName("nap_content")[0];
  if (nap_content.style.display === "block") {
    nap_content.style.display = "none";
  } else {
    nap_content.style.display = "block";
  }
});

async function sendMessage({ type, time }) {
  try {
    await chrome.runtime.sendMessage(
      {
        time,
        type,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
        } else {
          if(response.success) {
            // send notification to client
            chrome.runtime.sendMessage({
              type: "successNotification",
              message: response.message,
            })
          }else {
            chrome.runtime.sendMessage({
              type: "errorNotification",
              message: "Oops! Something went wrong. Please try to refresh the extension.",
            })
          }
        }
      }
    );
  } catch (error) {
    await chrome.runtime.sendMessage({
      type: "errorNotification",
      message: error || "an Error Occured while creating alarm",
    });
  }
}

async function cancelAlarm({ type }) {
  try {
    await chrome.runtime.sendMessage(
      {
        type,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
        } else {
          // send notification to client
          chrome.runtime.sendMessage({
            type: "successNotification",
            message: response.message,
          });
        }
      }
    );
  } catch (error) {
    chrome.runtime.sendMessage({
      type: "errorNotification",
      message: error || "an Error Occured while cacelling alarm",
    });
  }
}

function submit() {
  let time_water = document.getElementsByName("water_break_input")[0].value;
  console.log(time_water);

  let time_nap = document.getElementsByName("nap_break_input")[0].value;
  console.log(time_nap);

  if (time_water) {
    sendMessage({ type: "water", time: parseInt(time_water) });
  }
 
  // set state if changed
  if (!water_break_input.checked) {
    chrome.storage.sync.set({ isWaterChecked: false });
    cancelAlarm({ type: "remove alarm for water" });
  }

  // Clearing inputs
  document.getElementsByName("water_break_input")[0].value = "";
  document.getElementsByName("nap_break_input")[0].value = "";
  window.close();
}

document.getElementById("submit_btn").addEventListener("click", submit);

/*
Tasks 📃:
1. Implement a dynamic checkbox behaviour once alarm is created checkbox should be enabled until off - ✔️
2. Implement Logic to cancel alarm - ✔️
3. Show Notification when alarm created or cancelled - ✔️
4. Change Notification Icon's - ✔️
5. on extension refresh, clear all alarms

Bugs 🪲:
- change state when i clicked on submit - ✔️
- sendResponse is not working while creating alarm - ✔️
- notification not working when i'm interacting from Extension
*/