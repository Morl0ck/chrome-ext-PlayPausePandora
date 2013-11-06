var pandoraTabId;

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
  }
}

function getPandoraTabId() {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isPandoraUrl(tab.url)) {
        console.log("Found tab id: " + tab.id);
        pandoraTabId = tab.id;
      }
    }
  });
}

function goToPandora() {
  console.log('Going to pandora...');
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isPandoraUrl(tab.url)) {
        pandoraTabId = tab.id;
        console.log('Found Pandora tab: ' + tab.url + '.');
        //chrome.tabs.update(tab.id, {selected: true});
        chrome.tabs.executeScript(pandoraTabId, {
          //code: "$('.pauseButton:visible, .playButton:visible').click();"
          code: 'var pauseButton = document.getElementsByClassName("pauseButton")[0]; \
                 var playButton = document.getElementsByClassName("playButton")[0]; \
                 if (playButton.style.display == "none" ) { pauseButton.click(); "paused"; } \
                 else { playButton.click(); "playing"}'
        }, function (callback) {
          if (callback == "playing") {
            chrome.browserAction.setIcon({path:"action-pause.png"});
          } else if (callback == "paused") {
            chrome.browserAction.setIcon({path:"action-play.png"});
          }
        })
        return;
      }
    }
    console.log('Could not find Gmail tab. Creating one...');
    chrome.browserAction.setIcon({path:"action-pause.png"});
    chrome.tabs.create({url: getPandoraUrl()});
    getPandoraTabId();
  });
}

function onAlarm(alarm) {
  console.log('Got alarm', alarm);
  if (alarm && alarm.name == 'stillListening') {
    stillListening();
  }
}

getPandoraTabId();
chrome.browserAction.onClicked.addListener(goToPandora);
chrome.tabs.onRemoved.addListener(pandoraTabRemoved);
chrome.alarms.create('stillListening', {periodInMinutes: 1});
chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);