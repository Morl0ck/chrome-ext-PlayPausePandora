var songTitle = null,
	songArtist = null,
	songAlbum = null,
	songArt = null;

// $('.PauseButton').on('click', function () {
// 	// send message to extension saying it is paused
// 	chrome.runtime.sendMessage({message: "paused"});
// });

$('.PlayButton').on('click', function () {
	var status = $('.PlayButton').data('qa');
	// send message to extension saying it is playing
	chrome.runtime.sendMessage({
		message: status == 'pause_button' ? "playing" : "paused"
	});
});

// DOM Events Listed Below:
//
// DOMNodeInserted
// DOMNodeRemoved
// DOMAttrModified 
// DOMSubtreeModified

// $('.nowPlayingTopInfo__current__trackName').bind("DOMNodeInserted", function () {
// 	songTitle = $(this).text();
// 	getSongInfo();
// });

// $('.nowPlayingTopInfo__current__artistName').bind("DOMNodeInserted", function () {
// 	songArtist = $(this).text();
// 	getSongInfo();
// });

// $('.nowPlayingTopInfo__current__albumName').bind("DOMNodeInserted",function () {
// 	songAlbum = $(this).text();
// 	getSongInfo();
// });

// $('.nowPlayingTopInfo__artContainer__art').bind("DOMNodeInserted", function () {
// 	// var imgs = $(this).find('img');
// 	// if (imgs.length > 1) {
// 	// 	songArt = $(imgs[1]).attr('src');
// 	// } else {
// 	// 	songArt = $(imgs[0]).attr('src');
// 	// }
// 	songArt = $('meta[property="og:image"]').attr('content');
// 	getSongInfo();
// });

var nowPlayingSong = "";
var nowPlayingArtist = "";
var nowPlayingAlbum = "";
var nowPlayingAlbumArt = "";

setInterval(function () {
	var currentSong = $('.nowPlayingTopInfo__current__trackName').text().trim();
	var currentArtist = $('.nowPlayingTopInfo__current__artistName').text().trim();
	var currentAlbum = $('.nowPlayingTopInfo__current__albumName').text().trim();
	var currentAlbumArt = $('.nowPlayingTopInfo__artContainer__art').first().css('background-image').replace(/url\(|\)|\"/g, '').trim()

	if (currentSong != ""
		&& currentArtist != ""
		&& currentAlbum != ""
		&& currentAlbumArt != ""
		&& nowPlayingSong != currentSong
		&& nowPlayingArtist != currentArtist
		&& nowPlayingAlbum != currentAlbum
		&& nowPlayingAlbumArt != currentAlbumArt)
	{
		getSongInfo();
		nowPlayingSong = currentSong;
		nowPlayingArtist = currentArtist;
		nowPlayingAlbum = currentAlbum;
		nowPlayingAlbumArt = currentAlbumArt;
	}

	getPlaying();

}, 100)

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "hello") {
            sendResponse({message: "hi"});
            getSongInfo();
        }
 });

function getPlaying() {
	var status = $('.PlayButton').data('qa');

	chrome.runtime.sendMessage({
		message: status == 'pause_button' ? "playing" : "paused"
	});
}

function getSongInfo() {
	songTitle = $('.nowPlayingTopInfo__current__trackName').text().trim();
	songArtist = $('.nowPlayingTopInfo__current__artistName').text().trim();
	songAlbum = $('.nowPlayingTopInfo__current__albumName').text().trim();
	songArt = $('.nowPlayingTopInfo__artContainer__art').first().css('background-image').replace(/url\(|\)|\"/g, '').trim()
	checkIfReadyToSend();
}

function checkIfReadyToSend() {
	if ( songTitle != null && songTitle != "" &&
		 songArtist != null && songArtist != "" &&
		 songAlbum != null && songAlbum != "" &&
		 songArt != null && songArt != "") {
		sendSongChanged();
	}

}

function sendSongChanged() {
  	chrome.runtime.sendMessage({ message: "songChanged",
								 songTitle: songTitle,
								 songArtist: songArtist,
								 songArt: songArt,
								 songAlbum: songAlbum });

  	// clear all variables for next check
  	songTitle = null;
	songArtist = null;
	songAlbum = null;
	songArt = null;
}

// getPlaying(); getSongInfo();
