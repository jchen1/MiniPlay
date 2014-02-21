// Interfaces with the Google Play Music tab

chrome.extension.onMessage.addListener(function(message, sender, callback) {
  if (message.action == 'update_status') {
    update_status(callback);
  }
});

function update_status(callback) {
  music_status.update();
  callback(music_status);
}