// Interfaces with the Google Play Music tab

chrome.extension.onMessage.addListener(function(message, sender, callback) {
  if (message.action == 'update_status') {
    update_status(callback);
  }
  if (message.action == 'send_command') {
    send_command(message.type, callback);
  }
});

function update_status(callback) {
  callback(music_status.update());
}

function send_command(type, callback) {
  var $button;
  if (type == 'play') {
    $button = $('button[data-id="play-pause"]');
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
  if ($('button[data-id="play-pause"]').attr('disabled')) {
    $instant_mix = $('li[data-type="rd"]').click();
    setTimeout(function() {
      $('div[data-type="im"] .radio-icon').first().click();
    }, 1000);
  }
  else {
    $button.click();
  }

  callback();
}