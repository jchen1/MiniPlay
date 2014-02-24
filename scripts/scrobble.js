var apiKey = '8acdad46ec761ef21ba93ce72a888f1b';
var apiURL = "https://ws.audioscrobbler.com/2.0/?";

function auth() {
  $.get(apiURL + 'method=auth.gettoken&api_key=' + apiKey, function (data) {
    if ($(data).find('lfm').attr('status') == 'ok') {
      var token = $(data).find('token').text();
      chrome.storage.sync.set({'lastfm_token': token});

      chrome.tabs.create(
      {
        url: ('https://www.last.fm/api/auth/?api_key=' + apiKey + '&token=' + token)
      });
    }
    else {
      chrome.storage.sync.set({'lastfm_token': ''});
    }
  });
}

function getSessionID(cb) {
  chrome.storage.sync.get(['lastfm_token', 'lastfm_sessionID'], function (data) {
    if (data['lastfm_token'] === undefined || data['lastfm_token'] == '') {
      auth();
      cb(false);
    }
    else if (data['lastfm_sessionID'] !== undefined && data['lastfm_sessionID'] != '') {
      cb(data['lastfm_sessionID']);
    }
    else {
      var params = {
        method: 'auth.getsession',
        api_key: apiKey,
        token: data['lastfm_token']
      };
      var url = apiURL + get_query_string(params);

      $.get(url, function (data) {
        var status = $(data).find('lfm').attr('status');

        if (status == 'ok') {
          var key = $(data).find('key').text();
          chrome.storage.sync.set({'lastfm_sessionID': key});
          cb(key);
        }
        else {
          chrome.storage.sync.set({'lastfm_sessionID': ''});
          auth();
          cb(false);
        }  
      });
    }
  });
}

function get_query_string(params) {
  var parts = new Array(), keys = new Array();
  var o = ''

  for (var x in params) {
    parts.push(x + '=' + encodeURIComponent(params[x]));
    keys.push(x);
  }

  keys.sort();

  for (i = 0; i < keys.length; i++) {
    if (keys[i] == 'format' || keys[i] == 'callback') {
      continue;
    }
    o = o + keys[i] + params[keys[i]];
  }

  return parts.join('&') + '&api_sig=' +
         MD5(o + 'de379e5188615868380b23f62068f1e6');
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
        if (total_time > 30 &&
           (current_time >= 240 || current_time * 2 >= total_time)) {
          var params = {
            method: 'track.scrobble',
            'artist[0]': details.artist,
            'track[0]': details.title,
            'timestamp[0]': Math.round(((new Date().getTime() / 1000) - get_time(details.total_time))),
            'album[0]': details.album,
            sk: session_id,
            api_key: apiKey
          };

          var url = apiURL + get_query_string(params);

          $.post(url, params).always(function(data) {
            var status = $(data).find('lfm').attr('status');
            if (status == 'failed') {
              chrome.notifications.create('',
              {
                type: 'basic',
                title: "Scrobbling failed!",
                message: "Reauthenticate Last.fm account in the settings page",
                iconUrl: "../img/icon-128.png"
              }, function(id){});
            }
          })
        }
      });
    }
  })
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'auth') {
    auth();
  }
});