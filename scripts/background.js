//background tab, always running

chrome.storage.local.set({'id': -1});
chrome.storage.local.set({'last_notification': ''});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.local.get('id', function (data) {
    if (data['id'] === -1 && changeInfo.url &&
        changeInfo.url.search('play.google.com/music') !== -1) {
      chrome.storage.local.set({'id': tabId});
    }
    else if (data['id'] === tabId && changeInfo.url &&
             changeInfo.url.search('play.google.com/music') === -1) {
      chrome.storage.local.set({'id': -1});
    }
  });
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  chrome.storage.local.get('id', function (data) {
    if (data['id'] === tabId) {
      chrome.storage.local.set({'id': -1});
    }
  });
});

function create_notification(details) {
  chrome.storage.sync.get('notifications-enabled', function (ans) {
    if (ans['notifications-enabled'] === true) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', details.album_art);
      xhr.responseType = 'blob';
      xhr.onload = function(){
        var blob = this.response;
        chrome.notifications.create('',
        {
          type: 'basic',
          title: details.title,
          message: details.artist,
          contextMessage: details.album,
          iconUrl: window.URL.createObjectURL(blob)
        }, function(id){
          chrome.storage.local.get('last_notification', function (data) {
            if (data['last_notification']) {
              chrome.notifications.clear(data['last_notification'], function(cleared){});
            }
            chrome.storage.local.set({'last_notification': id});
          });
        });
      };
      xhr.send(null);
    }
  });
}

chrome.storage.onChanged.addListener(function (changes, area) {
  if (changes['music_status'] && changes['music_status'].newValue) {
    var oldValue = changes['music_status'].oldValue
    var newValue = changes['music_status'].newValue;

    if (oldValue === undefined ||
        oldValue.title != newValue.title ||
        oldValue.artist != newValue.artist ||
        oldValue.album_art != newValue.album_art) {
      scrobble(oldValue);
      if (newValue.title != '') {
        create_notification(newValue);
        now_playing(newValue);
      }
    }
  }
});

chrome.notifications.onClicked.addListener(function (id) {
  chrome.storage.local.get(['id', 'lastfm_fail_id'], function (data) {
    if (data['lastfm_fail_id'] === id) {
      chrome.tabs.create({url: chrome.extension.getURL('options.html')});
    }
    else if (data['id'] && data['id'] !== -1) {
      chrome.tabs.update(data['id'], {selected: true});
    }
  });
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    chrome.storage.sync.get(['notifications-enabled', 'shortcuts-enabled', 'scrobbling-enabled'], function (data) {
      if (data['notifications-enabled'] === undefined) {
        chrome.storage.sync.set({'notifications-enabled': true});
      }
      if (data['shortcuts-enabled'] === undefined) {
        chrome.storage.sync.set({'shortcuts-enabled': true});
      }
      if (data['scrobbling-enabled'] === undefined) {
        chrome.storage.sync.set({'scrobbling-enabled': true});
      }
      chrome.tabs.create({url: chrome.extension.getURL('options.html')});
    });
  }
});

chrome.commands.onCommand.addListener(function (command) {
  chrome.storage.local.get('id', function (local) {
    chrome.storage.sync.get('shortcuts-enabled', function (sync) {
      if (sync['shortcuts-enabled'] === true && local['id'] !== -1) {
          chrome.tabs.sendMessage(local['id'], { action: 'send_command', type: command });
        }
    });
  });
});
