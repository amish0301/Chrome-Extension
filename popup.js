const nap_break_input = document.getElementById("nap_break");
const water_break_input = document.getElementById("water_break");

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["isWaterChecked"], (res) => {
    water_break_input.checked = res.isWaterChecked || false;
  });

  water_break_input.addEventListener("change", function () {
    if (water_break_input.checked) {
      document.getElementsByClassName("expand_water")[0].style.display = "block";
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

function submit() {
  let time_water = document.getElementsByName("water_break_input")[0].value;
  console.log(time_water);

  let time_nap = document.getElementsByName("nap_break_input")[0].value;
  console.log(time_nap);

  // PENDING: send time_water and time_nap to server
  async function sendMessage({ type, time }) {
    try {
      await chrome.runtime.sendMessage({
        time,
        type,
      });
    } catch (error) {
      console.log(error);
    }
  }
  if (time_water) {
    sendMessage({ type: "water", time: parseInt(time_water) });
  }

  // set state if changed
  if(!water_break_input.checked) {
    chrome.storage.sync.set({ isWaterChecked: false });
    // stop alarm
  }

  // Clearing inputs
  document.getElementsByName("water_break_input")[0].value = "";
  document.getElementsByName("nap_break_input")[0].value = "";
  window.close();
}

document.getElementById("submit_btn").addEventListener("click", submit);

// if(!water_break_input.checked) {
//   // clear alarm
//   chrome.runtime.sendMessage({
//     type: "remove alarm for water"
//   });
// }

// ALL Message Listening - In Testing Mode

// chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
//     if(response.message === "Removed alarm for Water") {
//       chrome.notifications.create({
//         type: "basic",
//         iconUrl: "https://www.freeiconspng.com/thumbs/alert-icon/alert-icon-alert-icon-12.jpg",
//         title: "Your Reminder",
//         message: "Removed alarm for Water",
//         priority: 1
//       });
//     }
// })

/*
Tasks:
1. Implement a dynamic checkbox behaviour once alarm is created checkbox should be enabled until off - ✔️


Bugs 🪲:
- change state when i clicked on submit - ✔️
*/