let backgroundPort = null;
let popupPort = null;
let oldStatus = null;

const routes = {};

function createBackgroundMsg(oldValue, newValue) {
  const msg = { scrobble: false, notify: false };
  msg.oldValue = oldValue;
  msg.newValue = newValue;
  if (oldValue !== undefined && (oldValue.title !== newValue.title ||
      oldValue.artist !== newValue.artist || oldValue.album_art !== newValue.album_art)) {
    msg.scrobble = true;
    if (newValue.title !== '') {
      msg.notify = true;
    }
    return msg;
  }
  return null;
}

function update() {
  if (backgroundPort && typeof (backgroundPort) !== 'undefined') {
    oldStatus = JSON.parse(JSON.stringify(musicStatus));
    musicStatus.update();
    const msg = createBackgroundMsg(oldStatus, musicStatus);
    if (msg !== null) {
      backgroundPort.postMessage(msg);
    }
    if (popupPort) {
      popupPort.postMessage({
        type: 'status',
        data: musicStatus
      });
    }
  }
}

function route(name, callback) {
  routes[name] = callback;
}

function handleMessage(msg) {
  if (routes[msg.action] !== undefined) {
    routes[msg.action](msg);
  }
}

function globalInit() {
  backgroundPort = chrome.runtime.connect({ name: 'interface' });

  route('update_status', update);

  backgroundPort.onMessage.addListener(handleMessage);

  chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'popup') {
      popupPort = port;
      port.onDisconnect.addListener(() => {
        popupPort = null;
      });
      port.onMessage.addListener(handleMessage);
      update();
    }
  });

  window.setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', globalInit);
if (document.readyState !== 'loading') {
  globalInit();
}

