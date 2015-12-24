// Interfaces with the Pandora tab

function update_slider(position) {  //position is in %
  var button = document.getElementsByClassName('volumeButton')[0];
  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent( 'mouseover', true, false);
  button.dispatchEvent(evt);

  var slider = document.getElementsByClassName('volumeBackground')[0];
  var newWidth = Math.round(position * 82) + 43;
  var rect = slider.getBoundingClientRect();

  slider.dispatchEvent(new MouseEvent('click', {
    clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
    clientY: rect.top + slider.clientTop - slider.scrollTop,
    bubbles: true
  }));

  evt = document.createEvent('MouseEvents');
  evt.initMouseEvent( 'mouseout', true, false);
  button.dispatchEvent(evt);
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
      update_slider(message.position); break;
  }
  if ($button !== null) {
    $button.click();
  }
  window.setTimeout( function() {
    update();
  }, 30);
}
