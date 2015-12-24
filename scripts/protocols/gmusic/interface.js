// Interfaces with the Google Play Music tab

$(function() {
  var background_port = chrome.runtime.connect({name: "interface"});
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
    var slider = document.getElementById(slidername).getElementsByTagName('paper-progress')[0];

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
        $button = $('paper-icon-button[data-id="play-pause"]');
        break;
      case 'rew':
        $button = $('paper-icon-button[data-id="rewind"]'); break;
      case 'ff':
        $button = $('paper-icon-button[data-id="forward"]'); break;
      case 'up':
        $button = $('paper-icon-button[data-rating="5"]'); break;
      case 'down':
        $button = $('paper-icon-button[data-rating="1"]'); break;
      case 'shuffle':
        $button = $('paper-icon-button[data-id="shuffle"]'); break;
      case 'repeat':
        $button = $('paper-icon-button[data-id="repeat"]'); break;
      case 'slider':
        update_slider(message.position, 'material-player-progress'); break;
      case 'vslider':
        update_slider(message.position, 'material-vslider'); break;
      case 'playlist':
        $button = $('.song-table > tbody > .song-row[data-index="'+message.index+'"] > td[data-col="song-details"] button'); break;
      case 'playlist-button':
        // Toggle the playlist to set it up for viewing
        if (!$('#queue-overlay').hasClass('sj-opened')) {
          $('#queue').click();
          window.setTimeout(function() {
            $('#queue').click();
          }, 100);
        }
        break;
    }
    if ($button !== null) {
      $button.click();
    }
    window.setTimeout( function() {
      update();
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
