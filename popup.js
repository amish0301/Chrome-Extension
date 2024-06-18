const nap_break_input = document.getElementById("nap_break");
const water_break_input = document.getElementById("water_break");

// for preserving the state
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync
    .get(["isWaterChecked"])
    .then((result) => {
      water_break_input.checked = result.isWaterChecked;
    })
    .catch((err) => {
      console.log("Error in storage");
    });

  water_break_input.addEventListener("change", function () {
    if (water_break_input.checked) {
      document.getElementsByClassName("expand_water")[0].style.display =
        "block";
      chrome.storage.sync.set({ isWaterChecked: true });
    } else {
      document.getElementsByClassName("expand_water")[0].style.display = "none";
      chrome.storage.sync.set({ isWaterChecked: false });
    }
  });

  chrome.storage.sync
    .get(["isNapChecked"])
    .then((result) => {
      nap_break_input.checked = result.isNapChecked;
    })
    .catch((err) => {
      console.log("Error in storage");
    });

  nap_break_input.addEventListener("change", function () {
    if (nap_break_input.checked) {
      document.getElementsByClassName("expand_nap")[0].style.display = "block";
      chrome.storage.sync.set({ isNapChecked: true });
    } else {
      document.getElementsByClassName("expand_nap")[0].style.display = "none";
      chrome.storage.sync.set({ isNapChecked: false });
    }
  });
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
          if (response.success) {
            // send notification to client
            chrome.runtime.sendMessage({
              type: "successNotification",
              message: response.message,
            });

            if (type == "water")
              chrome.storage.sync.set({ prevTimeOfWater: time });
            if (type == "nap") chrome.storage.sync.set({ prevTimeOfNap: time });
          } else {
            chrome.runtime.sendMessage({
              type: "errorNotification",
              message:
                "Oops! Something went wrong. Please try to refresh the extension.",
            });
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
          if (type == "remove alarm for water")
            chrome.storage.sync.set({ prevTimeOfWater: -1 });
          if (type == "remove alarm for nap")
            chrome.storage.sync.set({ prevTimeOfNap: -1 });

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

async function submit() {
  let input_water_time = document.getElementsByName("water_break_input")[0].value;
  let input_nap_time = document.getElementsByName("nap_break_input")[0].value;

  if (input_water_time > 0)
    await sendMessage({ type: "water", time: parseInt(input_water_time) });

  if (input_nap_time > 0)
    await sendMessage({ type: "nap", time: parseInt(input_nap_time) });

  let water_state = await chrome.storage.sync.get("isWaterChecked");
  let water_time = await chrome.storage.sync.get("prevTimeOfWater");
  if (water_time.prevTimeOfWater > 0 && !water_state.isWaterChecked) {
    await cancelAlarm({ type: "remove alarm for water" });
    chrome.storage.sync.set({ isWaterChecked: false });
  }

  let nap_state = await chrome.storage.sync.get("isNapChecked");
  let nap_time = await chrome.storage.sync.get("prevTimeOfNap");
  if (nap_time.prevTimeOfNap > 0 && !nap_state.isNapChecked) {
    await cancelAlarm({ type: "remove alarm for nap" });
    chrome.storage.sync.set({ isNapChecked: false });
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

Bugs 🪲:
- change state when i clicked on submit - ✔️
- sendResponse is not working while creating alarm - ✔️
- if alarm is not created, still notification getting for cleared alarm - ✔️
- alarm works only on when input time is more than 1 minute - ✔️
*/