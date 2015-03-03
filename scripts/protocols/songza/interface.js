// Interfaces with the songza tab

$(function() {
  var background_port = chrome.runtime.connect({name: "interface"});
  var popup_port = null;
  var old_status = null;

  function update(slider, vslider) {
    old_status = JSON.parse(JSON.stringify(music_status));
    music_status.update();
    music_status.slider_updated = (slider == true);
    music_status.vslider_updated = (vslider == true);
    // socket.emit('data', music_status);
    var msg = create_background_msg(old_status, music_status);
    if (msg != null) {
      background_port.postMessage(msg);
    }
    if (popup_port) {
      popup_port.postMessage(music_status);
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

  function update_slider(position) {  //position is in %
    $('#volume-control-slider-input').val(100 * position);
    var changeEvent = document.createEvent("HTMLEvents");
    changeEvent.initEvent("change", true, true);
    document.getElementById("volume-control-slider-input").dispatchEvent(changeEvent);
  }

  function send_command(message) {
    var $button = null;
    switch (message.type) {
      case 'play':
        $button = $('.player-wrapper').hasClass('player-state-play') ? $('.ui-icon-ios7-pause') : $('.ui-icon-ios7-play');
        break;
      case 'ff':
        $button = $('.ui-icon-ios7-fastforward'); break;
      case 'up':
        $button = $('.ui-icon-thumb-up'); break;
      case 'down':
        $button = $('.ui-icon-thumb-down'); break;
      case 'vslider':
        update_slider(message.position); break;
    }
    if ($button !== null) {
      $button.click();
    }
    window.setTimeout( function() {
      update(false, message.type == 'vslider');
    }, 30);
  }

  function parseMessage(msg) {
    if (msg.action === 'update_status') {
      update();
    }
    if (msg.action === 'send_command') {
      send_command(msg);
    }
  }

  // var socket = io('https://miniplay.herokuapp.com');
  // socket.on('connect', function() {
  //   // TODO: find a better selector (user and authuser might not be 0)
  //   var email = $('a[href="/music/listen?u=0&authuser=0"] > div:contains("(default)") > div:contains("(default)")').text().split(' ')[0];
  //   socket.emit('room', {client : 'player', room : email});
  // });
  // socket.on('data', parseMessage);

  background_port.onMessage.addListener(parseMessage);

  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == 'popup') {
      popup_port = port;
      port.onDisconnect.addListener(function() {
        popup_port = null;
      });
      port.onMessage.addListener(function(msg) {
        if (msg.action === 'send_command') {
          send_command(msg);
        }
      });
      update(false, true);
    }
  });

  window.setInterval(update, 1000);
});
