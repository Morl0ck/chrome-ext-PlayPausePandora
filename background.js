var pandoraTabId = null;
var pandoraWindowId = null;
var isPlaying = false;
var wasPlaying = false;
var alreadyClicked = false;
var DEBUG = false;

var pandoraUrl = "http://www.pandora.com/";

function isPandoraUrl(url) {
  // Return whether the URL starts with the Pandora prefix.
  return url.indexOf(pandoraUrl) == 0;
}

function onInit() {
  if (DEBUG)
  {
    console.log("onInit");
  }
  if (pandoraTabId != null) {
    chrome.tabs.executeScript(pandoraTabId, {
      code: 'var pauseButton = document.getElementsByClassName("pauseButton")[0]; \
             var playButton = document.getElementsByClassName("playButton")[0]; \
             if (playButton.style.display == "none" ) { "playing"; } \
             else { "paused"; }'
    }, function (callback) {
      if (callback == "playing") {
        chrome.browserAction.setIcon({path:"action-pause.png"});
        isPlaying = true;
      } else if (callback == "paused") {
        chrome.browserAction.setIcon({path:"action-play.png"});
        isPlaying = false;
      }
    });
  }
}

function checkIfPandoraHasScripts() {
  chrome.tabs.sendMessage(pandoraTabId, {greeting: "hello"}, function(response) {
    if (response) {
        if (DEBUG)
        {
          console.log("Already there");
        }
    }
    else {
        if (DEBUG)
        {
          console.log("Content scripts not there, injecting content scripts");
        }
        chrome.tabs.executeScript(pandoraTabId, {file: "jquery.min.js"});
        chrome.tabs.executeScript(pandoraTabId, {file: "pppandora.js"});
        chrome.tabs.executeScript(pandoraTabId, {file: "areyoulistening_loop.js"});
        chrome.tabs.executeScript(pandoraTabId, {code: "getPlaying(); getSongInfo();"});
    }
  });
}

function pandoraTabRemoved(tabId, oRemoveInfo) {
  if (DEBUG)
  {
    console.log(tabId + " " + pandoraTabId);
  }
  if (tabId == pandoraTabId) {
    if (DEBUG)
    {
      console.log("Pandora tab closed! Nooooooooooooooo!");
    }
    chrome.browserAction.setIcon({path:"action-play.png"});
    isPlaying = false;
    pandoraTabId = null;
  }
}

function getAllWindows() {
  chrome.windows.getAll({populate:true},function (windows) {
    for (var i = 0; i < windows.length; i++) {
      getPandoraTabId(windows[i].id);
    };
  });
}

function getPandoraTabId(windowId) {
  chrome.tabs.getAllInWindow(windowId, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isPandoraUrl(tab.url)) {
        if (DEBUG)
        {
          console.log("Found tab id: " + tab.id + " in window: " + windowId);
        }
        pandoraTabId = tab.id;
        pandoraWindowId = window.id;
        onPandoraTabFound();
        checkIfPandoraHasScripts();
      }
    }
  });
}

function onPandoraTabFound() {
  chrome.browserAction.setIcon({path:"action-pause.png"});
  isPlaying = true;
}

function goToPandora() {
  if (alreadyClicked && pandoraTabId != null) {
    //Yes, Previous Click Detected

    //Clear timer already set in earlier Click
    clearTimeout(timer);
    if (DEBUG)
    {
      console.log("Double click - skipping song");
    }

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
    if (DEBUG)
    {
      console.log("Single click");
    }

    if (DEBUG)
    {
      console.log('Going to pandora...');
    }

    if (pandoraTabId != null)
    {
      chrome.tabs.executeScript(pandoraTabId, {
        code: "$('.pauseButton:visible, .playButton:visible').click();"
      });
    }
    else
    {
      chrome.browserAction.setIcon({path:"action-pause.png"});
      isPlaying = true;
      chrome.tabs.create({url: pandoraUrl});
      getAllWindows();
    }

    //Clear all timers
    clearTimeout(timer);

    //Ignore clicks
    alreadyClicked = false;
  }, 250);
}

function onMessage(request, sender, sendResponse) {
  switch (request.message) {
    case "paused":
      chrome.browserAction.setIcon({path:"action-play.png"});
      isPlaying = false;
      break;
    case "playing":
      chrome.browserAction.setIcon({path:"action-pause.png"});
      isPlaying = true;
      break;
    case "songChanged":
      chrome.browserAction.setTitle({ title: "Song: " + request.songTitle + "\nArtist: " + request.songArtist + "\nAlbum: " + request.songAlbum });
      if (parseBool(localStorage["showNotifications"])) {
        var options = {
          type: "list",
          title: request.songTitle,
          message: "",
          iconUrl: request.songArt,
          items: [
            { title: "Artist", message: request.songArtist},
            { title: "Album", message: request.songAlbum}
          ]
        };
        chrome.notifications.create(options.title, options, function () {});
        setTimeout(function() { chrome.notifications.clear(options.title, function() {}); }, 5000);
      }
      break;
    case "youtube_playing":
      wasPlaying = isPlaying;
      if (parseBool(localStorage["autoPauseYouTube"])) {
        chrome.tabs.executeScript(pandoraTabId, {
          code: "$('.pauseButton:visible').click();"
        });
      }
      break;
    case "youtube_paused":
      if (parseBool(localStorage["autoPauseYouTube"]) && wasPlaying) {
        chrome.tabs.executeScript(pandoraTabId, {
          code: "$('.playButton:visible').click();"
        });
      }
      break;
  }
}

function onCreated(tab) {
  if (DEBUG)
  {
    console.log("Tab Created", tab);
  }
  if (isPandoraUrl(tab.url)) {
    chrome.browserAction.setIcon({path:"action-pause.png"});
    isPlaying = true;
    pandoraTabId = tab.id;
  }
}

function onUpdated(tabId, oChangeInfo, tab) {
  if (DEBUG)
  {
    console.log("Tab Updated", tab);
  }
  if (tab.status == "complete" && isPandoraUrl(tab.url)) {
    chrome.browserAction.setIcon({ path:"action-pause.png" });
    isPlaying = true;
    pandoraTabId = tab.id;
  }
  else if (tab.id == pandoraTabId && !isPandoraUrl(tab.url)) {
    chrome.browserAction.setIcon({ path:"action-play.png" });
    isPlaying = false;
    pandoraTabId = null;
  }
}

getAllWindows();
chrome.browserAction.onClicked.addListener(goToPandora);
chrome.tabs.onRemoved.addListener(pandoraTabRemoved);
chrome.runtime.onMessage.addListener(onMessage);
chrome.runtime.onInstalled.addListener(onInit);
chrome.tabs.onCreated.addListener(onCreated);
chrome.tabs.onUpdated.addListener(onUpdated);
