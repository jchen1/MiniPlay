var apiKey = '8acdad46ec761ef21ba93ce72a888f1b';
var apiURL = "https://ws.audioscrobbler.com/2.0/?";

function auth(cb) {
  var request = new XMLHttpRequest();  
  request.open("GET", apiURL + 'method=auth.gettoken&api_key=' + apiKey, false);
  request.setRequestHeader('Content-Type', 'application/xml');
  request.send(null);

  var xml = $.parseXML(request.responseText);

  if ($(xml).find('lfm').attr('status') == 'ok') {
    chrome.storage.sync.set({'lastfm_token': $(xml).find('token').text()});

    chrome.tabs.create(
    {
      url: ('https://www.last.fm/api/auth/?api_key=' + apiKey + '&token=' + $(xml).find('token').text())
    });

    cb(true);
  }
  else {
    chrome.storage.sync.set({'lastfm_token': ''});
    cb(false);
  }
}

function getSessionID(cb) {
  chrome.storage.sync.get(['lastfm_token', 'lastfm_sessionID'], function (data) {
    if (data['lastfm_token'] === undefined || data['lastfm_token'] == '') {
      auth();
      cb(false);
      return;
    }
    if (data['lastfm_sessionID'] !== undefined && data['lastfm_sessionID'] != '') {
      cb(data['lastfm_sessionID']);
      return;
    }

    var params = {
      method: 'auth.getsession',
      api_key: apiKey,
      token: data['lastfm_token']
    };
    var signature = get_signature(params);
    var url = apiURL + get_query_string(params) + '&api_sig=' + signature;

    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.setRequestHeader('Content-Type', 'application/xml');
    request.send(null);

    var xml = $.parseXML(request.responseText);
    var status = $(xml).find('lfm').attr('status');

    if (status == 'ok') {
      var key = $(xml).find('key').text();
      chrome.storage.sync.set({'lastfm_sessionID': key});
      cb(key);
      return;
    }
    else {
      chrome.storage.sync.set({'lastfm_sessionID': ''});
      auth();
    }

    cb(false);
  });
}

function get_query_string(params) {
   var parts = new Array();

   for (var x in params)
      parts.push( x + '=' + encodeURIComponent( params[x] ) );

   return parts.join('&');
}

function get_signature(params) {
   var keys = new Array();
   var o = '';

   for (var x in params)
      keys.push(x);

   // params has to be ordered alphabetically
   keys.sort();

   for (i = 0; i < keys.length; i++) {
      if (keys[i] == 'format' || keys[i] == 'callback')
         continue;

      o = o + keys[i] + params[keys[i]];
   }

   //console.log('hashing %s', o);

   // append secret
   return MD5(o + 'de379e5188615868380b23f62068f1e6');
}

function get_time(time) {
  return (parseInt(time.split(':')[0]) * 60) + parseInt(time.split(':')[1]);
}

function scrobble(details) {
  chrome.storage.sync.get('scrobbling-enabled', function(response) {
    if (response['scrobbling-enabled'] == true) {
      if (details === undefined || details.title == '') {
        return;
      }
      var current_time = get_time(details.current_time);
      var total_time = get_time(details.total_time);

      getSessionID(function (session_id) {
        if (total_time > 30 && (current_time >= 240) || (current_time*2 >= total_time)) {
          var params = {
            method: 'track.scrobble',
            'artist[0]': details.artist,
            'track[0]': details.title,
            'timestamp[0]': Math.round(((new Date().getTime() / 1000) - get_time(details.total_time))),
            'album[0]': details.album,
            sk: session_id,
            api_key: apiKey
          };

          var api_sig = get_signature(params);
          var url = apiURL + get_query_string(params) + '&api_sig=' + api_sig;

          $.post(url, params);
        }
      });
    }
  })
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'auth') {
    auth(sendResponse);
  }
});