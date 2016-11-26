// Interfaces with the spotify tab

// TODO: fix
function updateSlider(position, slider) {  // position is in %
  let sliderElem;
  if (slider === 'slider') {
    sliderElem = document.getElementById('app-player').contentWindow.document.getElementById('bar-click');
  } else if (slider === 'vslider') {
    const button = document.getElementById('app-player').contentWindow.document.getElementById('volume-show');
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('mouseover', true, false);
    button.dispatchEvent(evt);
    sliderElem = document.getElementById('app-player').contentWindow.document.getElementById('volume-click');
  }
  const newWidth = Math.round(position * sliderElem.offsetWidth);
  const rect = sliderElem.getBoundingClientRect();

  sliderElem.dispatchEvent(new MouseEvent('mousedown', {
    clientX: newWidth + rect.left + sliderElem.clientLeft - sliderElem.scrollLeft,
    clientY: rect.top + sliderElem.clientTop - sliderElem.scrollTop,
    bubbles: true
  }));

  sliderElem.dispatchEvent(new MouseEvent('mouseup', {
    clientX: newWidth + rect.left + sliderElem.clientLeft - sliderElem.scrollLeft,
    clientY: rect.top + sliderElem.clientTop - sliderElem.scrollTop,
    bubbles: true
  }));
}

function sendCommand(message) {
  const iframe = document.querySelector('#app-player').contentDocument;
  let button = null;
  switch (message.type) {
    case 'play':
      button = iframe.querySelector('#play-pause'); break;
    case 'rew':
      button = iframe.querySelector('#previous'); break;
    case 'ff':
      button = iframe.querySelector('#next'); break;
    case 'shuffle':
      button = iframe.querySelector('#shuffle'); break;
    case 'repeat':
      button = iframe.querySelector('#repeat'); break;
    case 'slider':
      updateSlider(message.position, 'slider'); break;
    case 'vslider':
      updateSlider(message.position, 'vslider'); break;
    default:
      break;
  }
  if (button !== null) {
    button.click();
  }
  window.setTimeout(() => {
    update();
  }, 30);
}

function init() {
  route('sendCommand', sendCommand);
}

document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') {
  init();
}
