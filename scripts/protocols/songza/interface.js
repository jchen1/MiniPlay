// Interfaces with the songza tab

function updateSlider(position) {  // position is in %
  $('#volume-control-slider-input').val(100 * position);
  const changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, true);
  document.getElementById('volume-control-slider-input').dispatchEvent(changeEvent);
}

function sendCommand(message) {
  let $button = null;
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
      updateSlider(message.position); break;
    default:
      break;
  }
  if ($button !== null) {
    $button.click();
  }
  window.setTimeout(() => {
    update();
  }, 30);
}

$(() => {
  route('sendCommand', sendCommand);
});
