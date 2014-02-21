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

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  chrome.storage.local.get('id', function (data) {
    if (data['id'] == tabId) {
      chrome.storage.local.set({'id': '-1'});
    }
  })
});