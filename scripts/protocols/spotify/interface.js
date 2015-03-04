// Interfaces with the spotify tab

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
        oldValue.artist != newValue.artist)) {
      msg.scrobble = true;
      if (newValue.title.trim() != '') {
        msg.notify = true;
      }
      return msg;
    }
    else {
      return null;
    }
  }

  //TODO: fix
  function update_slider(position, slider) {  //position is in %
    var slider;
    if (slider == 'slider') {
      slider = document.getElementById('app-player').contentWindow.document.getElementById('bar-click');
    }
    else if (slider == 'vslider') {
      var button = document.getElementById('app-player').contentWindow.document.getElementById('volume-show');
      var evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('mouseover', true, false);
      button.dispatchEvent(evt);
      slider = document.getElementById('app-player').contentWindow.document.getElementById('volume-click');
    }
    var newWidth = Math.round(position * slider.offsetWidth);
    var rect = slider.getBoundingClientRect();

    slider.dispatchEvent(new MouseEvent('mousedown', {
      clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
      clientY: rect.top + slider.clientTop - slider.scrollTop,
      bubbles: true
    }));

    slider.dispatchEvent(new MouseEvent('mouseup', {
      clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
      clientY: rect.top + slider.clientTop - slider.scrollTop,
      bubbles: true
    }));
  }

  function send_command(message) {
    var iframe = $('#app-player').contents();
    var $button = null;
    switch (message.type) {
      case 'play':
        $button = iframe.find('#play-pause'); break;
      case 'rew':
        $button = iframe.find('#previous'); break;
      case 'ff':
        $button = iframe.find('#next'); break;
      case 'shuffle':
        $button = iframe.find('#shuffle'); break;
      case 'repeat':
        $button = iframe.find('#repeat'); break;
      case 'slider':
        update_slider(message.position, 'slider'); break;
      case 'vslider':
        update_slider(message.position, 'vslider'); break;
    }
    if ($button !== null) {
      $button.click();
    }
    window.setTimeout( function() {
      update(message.type == 'slider', message.type == 'vslider');
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
