var pandoraTabId = null;
var alreadyClicked = false;

function getPandoraUrl() {
  return "http://www.pandora.com/";
}

function isPandoraUrl(url) {
  // Return whether the URL starts with the Gmail prefix.
  return url.indexOf(getPandoraUrl()) == 0;
}

function stillListening() {
  console.log("Yes Pandora, I'm still listening...");
  chrome.tabs.executeScript(pandoraTabId, {
    code: "document.getElementsByClassName('still_listening')[0].click()"
  });
}

function onInit() {
  console.log("onInit");
  if (pandoraTabId != null) {
    chrome.tabs.executeScript(pandoraTabId, {
      code: 'var pauseButton = document.getElementsByClassName("pauseButton")[0]; \
             var playButton = document.getElementsByClassName("playButton")[0]; \
             if (playButton.style.display == "none" ) { "playing"; } \
             else { "paused"; }'
    }, function (callback) {
      if (callback == "playing") {
        chrome.browserAction.setIcon({path:"action-pause.png"});
      } else if (callback == "paused") {
        chrome.browserAction.setIcon({path:"action-play.png"});
      }
    });
  }
}

function pandoraTabRemoved(tabId, oRemoveInfo) {
  console.log(tabId + " " + pandoraTabId);
  if (tabId == pandoraTabId) {
    console.log("Pandora tab closed! Nooooooooooooooo!");
    chrome.browserAction.setIcon({path:"action-play.png"});
    pandoraTabId = null;
  }
}

function getPandoraTabId() {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isPandoraUrl(tab.url)) {
        console.log("Found tab id: " + tab.id);
        pandoraTabId = tab.id;
        onPandoraTabFound();
      }
    }
  });
}

function onPandoraTabFound() {
  chrome.browserAction.setIcon({path:"action-pause.png"});
}

function goToPandora() {
  if (alreadyClicked && pandoraTabId != null) {
    //Yes, Previous Click Detected

    //Clear timer already set in earlier Click
    clearTimeout(timer);
    console.log("Double click - skipping song");

    chrome.tabs.executeScript(pandoraTabId, {
      code: "$('.skipButton').click();"
    });

    //Clear all Clicks
    alreadyClicked = false;
    return;
  }

  alreadyClicked = true;

  //Add a timer to detect next click to a sample of 250
  timer = setTimeout(function () {
    //No more clicks so, this is a single click
    console.log("Single click");

    console.log('Going to pandora...');

    chrome.tabs.getAllInWindow(undefined, function(tabs) {
      for (var i = 0, tab; tab = tabs[i]; i++) {
        if (tab.url && isPandoraUrl(tab.url)) {
          pandoraTabId = tab.id;
          console.log('Found Pandora tab: ' + tab.url + '.');
          //chrome.tabs.update(tab.id, {selected: true});
          chrome.tabs.executeScript(pandoraTabId, {
            code: "$('.pauseButton:visible, .playButton:visible').click();"
            // code: 'var pauseButton = document.getElementsByClassName("pauseButton")[0]; \
            //        var playButton = document.getElementsByClassName("playButton")[0]; \
            //        if (playButton.style.display == "none" ) { pauseButton.click(); "paused"; } \
            //        else { playButton.click(); "playing"}'
          })
          return;
        }
      }
      console.log('Could not find Pandora tab. Creating one...');
      chrome.browserAction.setIcon({path:"action-pause.png"});
      chrome.tabs.create({url: getPandoraUrl()});
      getPandoraTabId();
    });

    //Clear all timers
    clearTimeout(timer);

    //Ignore clicks
    alreadyClicked = false;
  }, 250);
}

function onAlarm(alarm) {
  console.log('Got alarm', alarm);
  if (alarm && alarm.name == 'stillListening') {
    stillListening();
  }
}

function onMessage(request, sender, sendResponse) {
  switch (request.message) {
    case "paused":
      chrome.browserAction.setIcon({path:"action-play.png"});
      break;
    case "playing":
      chrome.browserAction.setIcon({path:"action-pause.png"});
      break;
    case "songChanged":
      var options = {
        type: "list",
        title: request.songTitle,
        message: "",
        iconUrl: request.songArt,
        items: [
          { title: "Artist", message: request.songArtist},
          { title: "Album", message: request.songAlbum}
        ]
      }
      chrome.notifications.create("", options, function (callback) { });
      break;
  }
}

function onCreated(tab) {
  console.log("Tab Created", tab);
  if (isPandoraUrl(tab.url)) {
    chrome.browserAction.setIcon({path:"action-pause.png"});
    pandoraTabId = tab.id;
  }
}

function onUpdated(tabId, oChangeInfo, tab) {
  console.log("Tab Updated", tab);
  if (tab.status == "complete" && isPandoraUrl(tab.url)) {
    chrome.browserAction.setIcon({ path:"action-pause.png" });
    pandoraTabId = tab.id;
  }
}

getPandoraTabId();
chrome.browserAction.onClicked.addListener(goToPandora);
chrome.tabs.onRemoved.addListener(pandoraTabRemoved);
chrome.alarms.create('stillListening', {periodInMinutes: 1});
chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onMessage.addListener(onMessage);
chrome.tabs.onCreated.addListener(onCreated);
chrome.tabs.onUpdated.addListener(onUpdated);