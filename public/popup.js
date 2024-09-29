const nap_break_input = document.getElementById("nap_break");
const water_break_input = document.getElementById("water_break");
const waterBreakInput = document.querySelector("input[name='water_break_input']");
const napBreakInput = document.querySelector("input[name='nap_break_input']");

const regex = /^\d+$/;

// for preserving the state
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { isWaterChecked, prevTimeOfWater } = await chrome.storage.sync.get([
      "isWaterChecked",
      "prevTimeOfWater",
    ]);

    water_break_input.checked = !(prevTimeOfWater < 0) && isWaterChecked;

    water_break_input.addEventListener("change", function () {
      document.getElementsByClassName("expand_water")[0].style.display =
        water_break_input.checked ? "block" : "none";
      chrome.storage.sync.set({ isWaterChecked: water_break_input.checked });
    });

    const { isNapChecked, prevTimeOfNap } = await chrome.storage.sync.get([
      "isNapChecked",
      "prevTimeOfNap",
    ]);

    nap_break_input.checked = !(prevTimeOfNap < 0) && isNapChecked;

    nap_break_input.addEventListener("change", function () {
      document.getElementsByClassName("expand_nap")[0].style.display =
        nap_break_input.checked ? "block" : "none";
      chrome.storage.sync.set({ isNapChecked: nap_break_input.checked });
    });
  } catch (error) {
    console.error("Error retrieving state from storage:", error);
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
  const input_water_time =
    waterBreakInput.value;
  const input_nap_time = napBreakInput.value;

  try {
    // Validate water break input
    if (regex.test(input_water_time) && parseInt(input_water_time) > 0) {
      await sendMessage({ type: "water", time: parseInt(input_water_time) });
      chrome.storage.sync.set({ isWaterChecked: true });
    }

    // Validate nap break input
    if (regex.test(input_nap_time) && parseInt(input_nap_time) > 0) {
      await sendMessage({ type: "nap", time: parseInt(input_nap_time) });
      chrome.storage.sync.set({ isNapChecked: true });
    }

    // Retrieve the states and times in a single call for efficiency
    const { isWaterChecked, prevTimeOfWater, isNapChecked, prevTimeOfNap } =
      await chrome.storage.sync.get([
        "isWaterChecked",
        "prevTimeOfWater",
        "isNapChecked",
        "prevTimeOfNap",
      ]);

    // Check if water alarm needs to be canceled
    if (prevTimeOfWater > 0 && !isWaterChecked) {
      await cancelAlarm({ type: "remove alarm for water" });
      chrome.storage.sync.set({ isWaterChecked: false });
    }

    // Check if nap alarm needs to be canceled
    if (prevTimeOfNap > 0 && !isNapChecked) {
      await cancelAlarm({ type: "remove alarm for nap" });
      chrome.storage.sync.set({ isNapChecked: false });
    }

    // Clear inputs only if alarms were successfully set
    document.getElementsByName("water_break_input")[0].value = "";
    document.getElementsByName("nap_break_input")[0].value = "";

    // Close the popup window
    window.close();
  } catch (error) {
    console.error("Error occurred during submission:", error);
  }
}

document.getElementById("submit_btn").addEventListener("click", submit);