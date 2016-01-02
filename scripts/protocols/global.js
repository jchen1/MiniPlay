var background_port = null;
var popup_port = null;
var old_status = null;

var routes = {};

function update() {
  if (background_port && typeof(background_port) !== 'undefined') {
    old_status = JSON.parse(JSON.stringify(music_status));
    music_status.update();
    var msg = create_background_msg(old_status, music_status);
    if (msg != null) {
      background_port.postMessage(msg);
    }
    if (popup_port) {
      popup_port.postMessage({
        'type': 'status',
        'data': music_status
      });
    }
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

function route(name, callback) {
  routes[name] = callback;
}

function handle_message(msg) {
  if (routes[msg.action] !== undefined) {
    routes[msg.action](msg);
  }
}

$(function() {
  background_port = chrome.runtime.connect({name: "interface"});

  route('update_status', update);

  background_port.onMessage.addListener(handle_message);

  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == 'popup') {
      popup_port = port;
      port.onDisconnect.addListener(function() {
        popup_port = null;
      });
      port.onMessage.addListener(handle_message);
      update();
    }
  });

  window.setInterval(update, 1000);
});

