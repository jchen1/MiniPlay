//background tab, always running

chrome.storage.local.set({'id': '-1'});
chrome.storage.local.set({'last_notification': ''});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.local.get('id', function (data) {
    if (changeInfo.url &&
        changeInfo.url.search('play.google.com/music') != -1 && 
        data['id'] == '-1') {
      chrome.storage.local.set({'id': tabId});
    }
    else if (changeInfo.url &&
             changeInfo.url.search('play.google.com/music') == -1 &&
             data['id'] == tabId) {
      chrome.storage.local.set({'id': '-1'});
    }
  });
});

window.setInterval(function() {
  chrome.storage.local.get('id', function (data) {
    if (data['id'] && data['id'] != '-1') {
      chrome.tabs.sendMessage(parseInt(data['id']), {action: 'update_status'},
      function (response) {
        chrome.storage.local.set({'music_status': response});
      });
    }
  });
}, 1000);

chrome.storage.onChanged.addListener(function (changes, area) {
  if (changes['music_status'] && changes['music_status'].newValue) {
    var oldValue = changes['music_status'].oldValue
    var newValue = changes['music_status'].newValue;

    if ((oldValue === undefined ||
        oldValue.title != newValue.title ||
        oldValue.artist != newValue.artist ||
        oldValue.album_art != newValue.album_art) && newValue.title != '') {
          chrome.storage.sync.get('notifications-enabled', function (ans) {
            if (ans['notifications-enabled'] == true) {
              console.log(ans['notifications-enabled']);
              var xhr = new XMLHttpRequest();
              xhr.open("GET", newValue.album_art);
              xhr.responseType = "blob";
              xhr.onload = function(){
                var blob = this.response;
                chrome.notifications.create('',
                  {
                    type: 'basic',
                    title: newValue.title,
                    message: newValue.artist,
                    contextMessage: newValue.album,
                    iconUrl: window.URL.createObjectURL(blob)
                  }, function(id){
                    chrome.storage.local.get('last_notification', function (data) {
                      if (data['last_notification']) {
                        chrome.notifications.clear(data['last_notification'],
                          function (wasCleared) {});
                      }   
                    });
                    chrome.storage.local.set({'last_notification': id});
                  });
              };
              xhr.send(null);
            }
          });
    }
  }
});

chrome.notifications.onClicked.addListener(function (id) {
  chrome.storage.local.get('id', function (data) {
    if (data['id'] && data['id'] != '-1') {
      chrome.tabs.update(parseInt(data['id']), {selected: true});
    }
  })
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  chrome.storage.local.get('id', function (data) {
    if (data['id'] == tabId) {
      chrome.storage.local.set({'id': '-1'});
    }
  });
});

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.sync.get(['notifications-enabled', 'shortcuts-enabled'], function (data) {
    if (data['notifications-enabled'] === undefined) {
      chrome.storage.sync.set({'notifications-enabled': true});
    }
    if (data['shortcuts-enabled'] === undefined) {
      chrome.storage.sync.set({'shortcuts-enabled': true});
    }
  });
});

chrome.commands.onCommand.addListener(function (command) {
  chrome.storage.local.get('id', function (data) {
    chrome.storage.sync.get('shortcuts-enabled', function (res) {
      if (res['shortcuts-enabled'] == true &&
          data['id'] != '-1') {
          chrome.tabs.sendMessage(parseInt(data['id']),
            { action: 'send_command', type: command });
        }
    });
  });
});