var apikey = '8acdad46ec761ef21ba93ce72a888f1b';
var apiurl = 'http://www.last.fm/api/auth/?api_key=';

function auth() {
  var request = new XMLHttpRequest();
  var apikey = '8acdad46ec761ef21ba93ce72a888f1b';
  var apiurl = 'http://www.last.fm/api/auth/?api_key=';
  request.open('GET', 'http://www.last.fm/api/auth/?api_key=' + apikey, false);
  request.setRequestHeader('Content-Type', 'application/xml');
  request.send(null);

  var xml = $.parseXML(request.responseText);
  console.log('hi' + request.responseText);

  if (xml.find('lfm').attr('status') == 'ok') {
    chrome.storage.sync.set({'lastfm_token': $(xml).find('token').text()});

    chrome.tabs.create({url: (apiurl + apikey + '&token=' + $(xml).find('token').text())});
  }
  else {
    chrome.storage.sync.set({'lastfm_token': ''});
  }
}