// Interfaces with the songza tab

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
    update();
  }, 30);
}

$(function() {
  route('send_command', send_command);
});
