chrome.storage.local.set({'id': '-1'});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.local.get('id', function (data) {
    //check if tab has been closed
    if (changeInfo.url.search('play.google.com/music') != -1 && 
        data['id'] == '-1') {
      chrome.storage.local.set({'id': tabId});
    }
  });
});