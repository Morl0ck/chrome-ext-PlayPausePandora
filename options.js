$('#notifications').change(function () {
  localStorage["showNotifications"] = $(this).prop('checked');
});

// Restores select box state to saved value from localStorage.
function restore_options() {
  $('#notifications').prop('checked', parseBool(localStorage["showNotifications"]));
}

$(document).ready(restore_options);