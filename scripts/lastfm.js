var apiKey = '8acdad46ec761ef21ba93ce72a888f1b';
var apiURL = "https://ws.audioscrobbler.com/2.0/?";

function auth() {
  var request = new XMLHttpRequest();  
  request.open("GET", apiURL + 'method=auth.gettoken&api_key=' + apiKey, false);
  request.setRequestHeader('Content-Type', 'application/xml');
  request.send(null);

  var xml = $.parseXML(request.responseText);
  console.log('hi' + request.responseText);

  if ($(xml).find('lfm').attr('status') == 'ok') {
    chrome.storage.sync.set({'lastfm_token': $(xml).find('token').text()});

    chrome.tabs.create(
      {
        url: ('https://www.last.fm/api/auth/?api_key=' + apiKey + '&token=' + $(xml).find('token').text())
      });
  }
  else {
    chrome.storage.sync.set({'lastfm_token': ''});
  }
}

function getSessionID() {
  chrome.storage.sync.get(['lastfm_token', 'lastfm_sessionID'], function (data) {
    if (!data['lastfm_token'] || data['lastfm_token'] == '') {
      auth();
      return false;
    }
  });
  if (data['lastfm_sessionID'] && data['lastfm_sessionID'] != '') {
    return data['lastfm_sessionID'];
  }
}