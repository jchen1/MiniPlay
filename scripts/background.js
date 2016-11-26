// background tab, always running

chrome.storage.local.set({ last_notification: '' });

let interfacePort = null;
let popupPort = null;
const loaderPorts = {};

function notifyHelper(details, url) {
  chrome.notifications.create('',
    {
      type: 'basic',
      title: details.title,
      message: details.artist,
      contextMessage: details.album,
      iconUrl: url,
      buttons: [
        {
          title: 'Play/Pause',
          iconUrl: 'img/notification_pp.png'
        },
        {
          title: 'Next song',
          iconUrl: 'img/notification_ff.png'
        }]
    }, id => {
      chrome.storage.local.get('last_notification', data => {
        if (data.last_notification) {
          chrome.notifications.clear(data.last_notification, () => {});
        }
        chrome.storage.local.set({ last_notification: id });
      });
    });
}

function createNotification(details) {
  chrome.storage.sync.get('notifications-enabled', ans => {
    if (ans['notifications-enabled'] === true) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', details.album_art);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        notifyHelper(details, window.URL.createObjectURL(this.response));
      };
      xhr.onerror = function() {
        notifyHelper(details, 'img/default_album.png');
      };
      xhr.send(null);
    }
  });
}

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'loader') {
    port.id = port.sender.tab.id;
    loaderPorts[port.id] = port;
    port.onMessage.addListener(msg => {
      if (msg.protocol) {
        chrome.tabs.executeScript(port.id, { file: 'scripts/enums.js' });
        chrome.tabs.executeScript(port.id, { file: 'scripts/protocols/global.js' });
        chrome.tabs.executeScript(port.id, { file: `scripts/protocols/${msg.protocol}/constants.js` });
        chrome.tabs.executeScript(port.id, { file: `scripts/protocols/${msg.protocol}/status.js` });
        chrome.tabs.executeScript(port.id, { file: `scripts/protocols/${msg.protocol}/interface.js` });
      }
    });
    port.onDisconnect.addListener(() => {
      loaderPorts[port.id] = null;
    });
  }
  if (port.name === 'interface' && !interfacePort) {
    interfacePort = port;
    interfacePort.id = port.sender.tab.id;
    port.onMessage.addListener(msg => {
      if (msg.scrobble === true) {
        scrobble(msg.oldValue);
      }
      if (msg.notify === true) {
        createNotification(msg.newValue);
        nowPlaying(msg.newValue);
      }
    });
    if (popupPort) {
      popupPort.postMessage({ type: 'connect', id: interfacePort.id });
    }

    port.onDisconnect.addListener(() => {
      interfacePort = null;
    });
  } else if (port.name === 'popup') {
    popupPort = port;
    port.onDisconnect.addListener(() => {
      popupPort = null;
    });
    if (interfacePort) {
      popupPort.postMessage({ type: 'connect', id: interfacePort.id });
    }
  }
});

chrome.notifications.onClicked.addListener(id => {
  chrome.storage.local.get('lastfm_fail_id', data => {
    if (data.lastfm_fail_id === id) {
      chrome.tabs.create({ url: chrome.extension.getURL('options.html') });
    } else if (interfacePort) {
      chrome.tabs.update(interfacePort.id, { highlighted: true });
    }
  });
});

chrome.notifications.onButtonClicked.addListener((id, buttonIndex) => {
  chrome.storage.local.get('last_notification', data => {
    if (data.last_notification === id && interfacePort) {
      switch (buttonIndex) {
        case 0: // Play/Pause
          interfacePort.postMessage({ action: 'sendCommand', type: 'play' }); break;
        case 1: // Next
          interfacePort.postMessage({ action: 'sendCommand', type: 'ff' }); break;
        default:
          break;
      }
    }
  });
});

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.storage.sync.get(['notifications-enabled', 'shortcuts-enabled', 'scrobbling-enabled'], data => {
      if (data['notifications-enabled'] === undefined) {
        chrome.storage.sync.set({ 'notifications-enabled': true });
      }
      if (data['shortcuts-enabled'] === undefined) {
        chrome.storage.sync.set({ 'shortcuts-enabled': true });
      }
      if (data['scrobbling-enabled'] === undefined) {
        chrome.storage.sync.set({ 'scrobbling-enabled': true });
      }
      chrome.tabs.create({ url: chrome.extension.getURL('options.html') });
    });
  }

  if (details.reason === 'install' || details.reason === 'update') {
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        if (tab.url.search('http') >= 0 && tab.url.search('chrome.google.com/webstore') === -1) {
          chrome.tabs.executeScript(tab.id, { file: 'scripts/loader.js' });
        }
      });
    });
  }
});

chrome.commands.onCommand.addListener(command => {
  chrome.storage.sync.get('shortcuts-enabled', sync => {
    if (sync['shortcuts-enabled'] === true && interfacePort !== null) {
      interfacePort.postMessage({ action: 'sendCommand', type: command });
    }
  });
});
