// Interfaces with the Google Play Music tab

chrome.runtime.sendMessage({type: 'session'}, function (response) {});

chrome.extension.onMessage.addListener(function(message, sender, callback) {
  if (message.action == 'get_status') {
    get_status(callback);
  }
  if (message.action == 'update_status') {
    update_status(callback);
  }
  if (message.action == 'send_command') {
    send_command(message.type, callback);
  }
  if (message.action == 'update_slider') {
    update_slider(message.position, callback);
  }
});

function get_status(callback) {
  callback(music_status);
}

function update_status(callback) {
  callback(music_status.update());
}

function update_slider(position, callback) {  //position is in %
  var slider = document.getElementById('slider');
  var newWidth = Math.round((position * slider.offsetWidth) / 100);
  var rect = slider.getBoundingClientRect();

  slider.dispatchEvent(new MouseEvent('click', {
    clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
    clientY: rect.top + slider.clientTop - slider.scrollTop
  }));
  callback(music_status.update());
}

function send_command(type, callback) {
  var $button;
  if (type == 'play') {
    $button = $('button[data-id="play-pause"]');
    if ($button.attr('disabled')) {
      $button = $('.description-overlay');
    }
  }
  else if (type == 'rew') {
    $button = $('button[data-id="rewind"]');
  }
  else if (type == 'ff') {
    $button = $('button[data-id="forward"]');
  }
  else if (type == 'up') {
    $button = $('li[title="Thumbs up"]');
  }
  else if (type == 'down') {
    $button = $('li[title="Thumbs down"]');
  }
  else if (type == 'shuffle') {
    $button = $('button[data-id="shuffle"]');
  }
  else if (type == 'repeat') {
    $button = $('button[data-id="repeat"]');
  }
  $button.click();
  callback(music_status.update());
}
