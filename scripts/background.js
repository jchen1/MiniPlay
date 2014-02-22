//background tab, always running

chrome.storage.local.set({'id': '-1'});

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
    console.log('hi');
    var oldValue = changes['music_status'].oldValue
    var newValue = changes['music_status'].newValue;

    if ((oldValue === undefined ||
        oldValue.title != newValue.title ||
        oldValue.artist != newValue.artist ||
        oldValue.album_art != newValue.album_art) && newValue.title != '') {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", newValue.album_art);
      xhr.responseType = "blob";
      xhr.onload = function(){
        var blob = this.response;
        chrome.notifications.create("MiniPlayNot",
          {
            type: 'basic',
            title: newValue.title,
            message: newValue.artist,
            contextMessage: newValue.album,
            iconUrl: window.URL.createObjectURL(blob),
          }, function(id){});
      };
      xhr.send(null);
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

chrome.commands.onCommand.addListener(function (command) {
  console.log(command);
  chrome.storage.local.get('id', function (data) {
    if (data['id'] != '-1') {
      chrome.tabs.sendMessage(parseInt(data['id']),
        { action: 'send_command', type: command });
    }
  });
});