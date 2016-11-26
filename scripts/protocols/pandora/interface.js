// Interfaces with the Pandora tab

function updateSlider(position) {  // position is in %
  const button = document.getElementsByClassName('volumeButton')[0];
  let evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('mouseover', true, false);
  button.dispatchEvent(evt);

  const slider = document.getElementsByClassName('volumeBackground')[0];
  const newWidth = Math.round(position * 82) + 43;
  const rect = slider.getBoundingClientRect();

  slider.dispatchEvent(new MouseEvent('click', {
    clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
    clientY: rect.top + slider.clientTop - slider.scrollTop,
    bubbles: true
  }));

  evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('mouseout', true, false);
  button.dispatchEvent(evt);
}

function sendCommand(message) {
  let button = null;
  switch (message.type) {
    case 'play':
      button = document.querySelector('.playButton');
      if (getComputedStyle(button).display === 'none') {
        button = document.querySelector('.pauseButton');
      }
      break;
    case 'ff':
      button = document.querySelector('.skipButton'); break;
    case 'up':
      button = document.querySelector('.thumbUpButton'); break;
    case 'down':
      button = document.querySelector('.thumbDownButton'); break;
    case 'vslider':
      updateSlider(message.position); break;
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
