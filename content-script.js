var port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "PLAY")) {
    console.log("Content script received: " + event.data.text);
  }
}, false);