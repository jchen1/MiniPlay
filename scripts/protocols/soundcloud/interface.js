$(function() {
  var background_port = chrome.runtime.connect({name: "interface"});
  var popup_port = null;
  var old_status = null;

  function update(slider, vslider) {
    old_status = JSON.parse(JSON.stringify(music_status));
    music_status.update();
    music_status.slider_updated = (slider == true);
    music_status.vslider_updated = (vslider == true);
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

  function update_slider(position, slidername) {  //position is in %
    var slider = document.getElementById(slidername).shadowRoot.getElementById('sliderBar');
    var newWidth = Math.round(position * slider.offsetWidth);
    var rect = slider.getBoundingClientRect();

    slider.dispatchEvent(new MouseEvent('mousedown', {
      clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
      clientY: rect.top + slider.clientTop - slider.scrollTop
    }));
  }

  function send_command(message) {
    var $button = null;
    switch (message.type) {
      case 'play':
        $button = $('.playControl');
        break;
      case 'rew':
        $button = $('.skipControl__previous'); break;
      case 'ff':
        $button = $('.skipControl__next'); break;
      case 'up':
        $button = $('.sc-button-like'); break;
      case 'repeat':
        $button = $('.repeatControl'); break;
      case 'slider':
        update_slider(message.position, 'material-player-progress'); break;
      case 'vslider':
        update_slider(message.position, 'material-vslider'); break;
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
