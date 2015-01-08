var DEBUG = false;

if (DEBUG) {
	console.log("youtube_autopauser.js loaded... looking for videos");
}

var videoPlaying = null;

$('video').each(function () {
	if (!$(this).paused) {
		videoPlaying = true;
		console.log("youtube is playing");
		chrome.runtime.sendMessage({message: "youtube_playing"}); // pause pandora
	}
});

$(document).on('click', '.html5-video-container', function () {
	console.log('trying to start video');
	videoPlaying = true;
	console.log("youtube is playing");
	chrome.runtime.sendMessage({message: "youtube_playing"}); // pause pandora
});

$(document).on('click', 'video', function () {
	if ($(this).data('autoPauserEvents') == "done") {
		// do nothing
	}
	else {
		// bind events to video
		$(this).on('play playing', function () {
			videoPlaying = true;
			console.log("youtube is playing");
			chrome.runtime.sendMessage({message: "youtube_playing"}); // pause pandora
		});

		$(this).on('pause ended', function () {
			videoPlaying = false;
			console.log("youtube is paused");
			chrome.runtime.sendMessage({message: "youtube_paused"}); // play pandora
		});

		$(this).data('autoPauserEvents', 'done');
	}
});

$(window).on('beforeunload', function () {
	console.log("window is closing");
	if (videoPlaying != null) {
		chrome.runtime.sendMessage({message: "youtube_paused"}); // play pandora
	}
});
