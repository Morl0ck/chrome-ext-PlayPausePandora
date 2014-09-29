if ($('video').length >= 1) {

	$('video').each(function () {
		if (!$(this).paused) {
			console.log("youtube is playing");
			chrome.runtime.sendMessage({message: "youtube_playing"}); // pause pandora
		}
	});

	$('video').on('play playing', function () {
		console.log("youtube is playing");
		chrome.runtime.sendMessage({message: "youtube_playing"}); // pause pandora
	});

	$('video').on('pause ended', function () {
		console.log("youtube is paused");
		chrome.runtime.sendMessage({message: "youtube_paused"}); // play pandora
	});

	$(window).on('beforeunload', function () {
		console.log("window is closing");
		chrome.runtime.sendMessage({message: "youtube_paused"}); // play pandora
	});
}