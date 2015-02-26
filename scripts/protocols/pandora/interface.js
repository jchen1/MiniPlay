$(function() {
  var background_port = chrome.runtime.connect({name: "interface"});
  var popup_port = null;
  var old_status = null;

  function update(slider, vslider) {
    old_status = JSON.parse(JSON.stringify(music_status));
    music_status.update();
    // socket.emit('data', music_status);
    var msg = create_background_msg(old_status, music_status);
    if (msg != null) {
      background_port.postMessage(msg);
    }
    if (popup_port) {
      popup_port.postMessage(music_status);
    }
  }

  function update_slider(position) {  //position is in %
    $('.volumeButton').mouseenter();
    var slider = document.getElementsByClassName('volumeBackground')[0];
    var newWidth = Math.round(position * 82) + 43;
    var rect = slider.getBoundingClientRect();

    slider.dispatchEvent(new MouseEvent('click', {
      clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
      clientY: rect.top + slider.clientTop - slider.scrollTop,
      bubbles: true
    }));
  }

  function create_background_msg(oldValue, newValue) {
    var msg = {scrobble: false, notify: false};
    msg.oldValue = oldValue;
    msg.newValue = newValue;
    if (oldValue !== undefined && (oldValue.title != newValue.title ||
        oldValue.artist != newValue.artist || oldValue.album_art != newValue.album_art ||
        (newValue.total_time_s == 0 && newValue.current_time_s == 0))) {
      console.log(JSON.parse(JSON.stringify(newValue)));
      msg.scrobble = true;
      if (newValue.title != '' && oldValue.title != newValue.title) {
        msg.notify = true;
      }
      return msg;
    }
    else {
      return null;
    }
  }

  function send_command(message) {
    var $button = null;
    switch (message.type) {
      case 'play':
        $button = $('.playButton');
        if ($button.css('display') == "none") {
          $button = $('.pauseButton');
        }
        break;
      case 'ff':
        $button = $('.skipButton'); break;
      case 'up':
        $button = $('.thumbUpButton'); break;
      case 'down':
        $button = $('.thumbDownButton'); break;
      case 'vslider':
        update_slider(message.position, 'vslider'); break;
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
      update();
    }
  });

  window.setInterval(update, 1000);
});
