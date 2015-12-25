// Interfaces with the spotify tab

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
    update();
  }, 30);
}

$(function() {
  route('send_command', send_command);
});
