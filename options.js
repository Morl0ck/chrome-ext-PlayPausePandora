$('#notifications').change(function () {
  localStorage["showNotifications"] = $(this).prop('checked');
});

$('#autoPauseYouTube').change(function () {
  localStorage["autoPauseYouTube"] = $(this).prop('checked');
});

// Restores select box state to saved value from localStorage.
function restore_options() {
  $('#notifications').prop('checked', parseBool(localStorage["showNotifications"]));
  $('#autoPauseYouTube').prop('checked', parseBool(localStorage["autoPauseYouTube"]));
}

$(document).ready(restore_options);