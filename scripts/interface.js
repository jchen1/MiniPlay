// Interfaces with the Google Play Music tab

chrome.runtime.sendMessage({type: 'session'}, function (response) {});

chrome.extension.onMessage.addListener(function(message, sender, callback) {
  if (message.action === 'update_status') {
    callback(music_status.update());
  }
  if (message.action === 'send_command') {
    send_command(message, callback);
  }
});

function update_slider(position, slidername) {  //position is in %
  var slider = document.getElementById(slidername);
  var newWidth = Math.round(position * slider.offsetWidth);
  var rect = slider.getBoundingClientRect();

  slider.dispatchEvent(new MouseEvent('click', {
    clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
    clientY: rect.top + slider.clientTop - slider.scrollTop
  }));
}

function send_command(message, callback) {
  var $button = null;
  switch (message.type) {
    case 'play':
      $button = $('button[data-id="play-pause"]');
      if ($button.attr('disabled')) {
        $button = $('[data-type="imfl"]');  // I'm feeling lucky radio
      }
      break;
    case 'rew':
      $button = $('button[data-id="rewind"]'); break;
    case 'ff':
      $button = $('button[data-id="forward"]'); break;
    case 'up':
      $button = $('li[title="Thumbs up"]'); break;
    case 'down':
      $button = $('li[title="Thumbs down"]'); break;
    case 'shuffle':
      $button = $('button[data-id="shuffle"]'); break;
    case 'repeat':
      $button = $('button[data-id="repeat"]'); break;
    case 'slider':
      update_slider(message.position, 'slider'); break;
    case 'vslider':
      update_slider(message.position, 'vslider'); break;
  }
  if ($button !== null) {
    $button.click();
  }
  window.setTimeout( function() {
    var status = music_status.update();
    if (message.type == 'slider') {
      status.slider_updated = true;
    }
    if (message.type == 'vslider') {
      status.vslider_updated = true;
    }
    callback(status);
  }, 10);
}

$(function() {
  window.setInterval(function() {
    var status = music_status.update();
    chrome.storage.local.set({'music_status': status});
  }, 1000);
});
