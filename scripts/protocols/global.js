var background_port = null;
var popup_port = null;
var old_status = null;

function update() {
  old_status = JSON.parse(JSON.stringify(music_status));
  music_status.update();
  var msg = create_background_msg(old_status, music_status);
  if (msg != null) {
    background_port.postMessage(msg);
  }
  if (popup_port) {
    popup_port.postMessage({
      'type': 'status',
      'status': music_status
    });
  }
}

function create_background_msg(oldValue, newValue) {
  var msg = {scrobble: false, notify: false};
  msg.oldValue = oldValue;
  msg.newValue = newValue;
  if (oldValue !== undefined && (oldValue.title != newValue.title ||
      oldValue.artist != newValue.artist || oldValue.album_art != newValue.album_art)) {
    msg.scrobble = true;
    if (newValue.title != '') {
      msg.notify = true;
    }
    return msg;
  }
  else {
    return null;
  }
}

function route(msg) {
  if (msg.action === 'update_status') {
    update();
  }
  if (msg.action === 'send_command') {
    send_command(msg);
  }
}

$(function() {
  background_port = chrome.runtime.connect({name: "interface"});
  background_port.onMessage.addListener(route);

  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == 'popup') {
      popup_port = port;
      port.onDisconnect.addListener(function() {
        popup_port = null;
      });
      port.onMessage.addListener(route);
      update();
    }
  });

  window.setInterval(update, 1000);
});

