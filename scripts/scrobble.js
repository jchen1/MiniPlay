var api_key = '8acdad46ec761ef21ba93ce72a888f1b';
var api_url = 'https://ws.audioscrobbler.com/2.0/';

function auth() {
  var params = {
    method: 'auth.gettoken',
    api_key: api_key
  };
  $.get(api_url + get_query_string(params), function (data) {
    if ($(data).find('lfm').attr('status') == 'ok') {
      var token = $(data).find('token').text();
      chrome.storage.sync.set({'lastfm_token': token});
      chrome.tabs.create(
      {
        url: ('https://www.last.fm/api/auth/?api_key=' + api_key + '&token=' + token)
      });
    }
    else {
      chrome.storage.sync.remove('lastfm_token');
    }
  });
}

function get_session_id(cb) {
  chrome.storage.sync.get(['lastfm_token', 'lastfm_sessionID'], function (data) {
    if (data['lastfm_token'] === undefined) {
      auth();
      cb('');
    }
    else if (data['lastfm_sessionID'] !== undefined) {
      cb(data['lastfm_sessionID']);
    }
    else {
      var params = {
        method: 'auth.getsession',
        api_key: api_key,
        token: data['lastfm_token']
      };
      $.get(api_url + get_query_string(params), function (xml) {
        if ($(xml).find('lfm').attr('status') == 'ok') {
          var key = $(xml).find('key').text();
          chrome.storage.sync.set({'lastfm_sessionID': key});
          cb(key);
        }
        else {
          chrome.storage.sync.remove('lastfm_sessionID');
          auth();
          cb('');
        }
      });
    }
  });
}

function now_playing(details) {
  chrome.storage.sync.get('scrobbling-enabled', function(response) {
    if (response['scrobbling-enabled'] == true && !(details === undefined || details.title === '')) {
      get_session_id(function(session_id) {
        if (session_id !== '') {
          var params = {
            method: 'track.updateNowPlaying',
            'artist': details.artist,
            'track': details.title,
            'album': details.album,
            sk: session_id,
            api_key: api_key
          };
          $.post(api_url + get_query_string(params), params).always(function(data) {
            console.log(data);
            var status = $(data).find('lfm').attr('status');
            if (status != 'ok') {
              var code = $(data).find('error').attr('code');
              if (code == '9' || code == '4') {
                fail_auth();
              }
              else {
                fail_scrobble(code);
              }
            }
          });
        }
        else {
          fail_auth();
        }
      });
    }
  });
}

function scrobble(details) {
  chrome.storage.sync.get('scrobbling-enabled', function(response) {
    if (response['scrobbling-enabled'] == true) {
      if (details === undefined || details.title === '') {
        return;
      }

      if (details.total_time_s > 30 && (details.current_time_s >= 240
          || 2*details.current_time_s >= details.total_time_s)) {
        get_session_id(function (session_id) {

          if (session_id != '') {
            var params = {
              method: 'track.scrobble',
              'artist[0]': details.artist,
              'track[0]': details.title,
              'timestamp[0]': Math.round((new Date().getTime() / 1000) - details.total_time_s),
              'album[0]': details.album,
              sk: session_id,
              api_key: api_key
            };
            $.post(api_url + get_query_string(params), params).always(function(data) {
              var status = $(data).find('lfm').attr('status');
              if (status != 'ok') {
                var code = $(data).find('error').attr('code');
                if (code == '9' || code == '4') {
                  fail_auth();
                }
                else {
                  fail_scrobble(code);
                }
              }
            });
          }
          else {
            fail_auth();
          }
        });
      }
    }
  });
}

function get_signature(params) {
  var keys = Object.keys(params);
  var string = '';

  keys.sort();
  keys.forEach(function(key) {
    string += key + params[key];
  });

  string += 'de379e5188615868380b23f62068f1e6';

  return MD5(string);
}

function get_query_string(params) {
  var parts = new Array(), keys = new Array();
  var o = '';

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
         get_signature(params);
}

function fail_auth() {
  chrome.notifications.create('lastfm_fail',
  {
    type: 'basic',
    title: 'Last.fm authentication failed!',
    message: 'Click here to reauthenticate.',
    iconUrl: '../img/icon-128.png'
  }, function(id){
    chrome.storage.local.set({'lastfm_fail_id': id});
  });
}

function fail_scrobble(code) {
  chrome.notifications.create('lastfm_fail_scrobble',
  {
    type: 'basic',
    title: 'Scrobbling failed!',
    message: 'Error ' + code,
    iconUrl: '../img/icon-128.png'
  }, function(id){
    chrome.storage.local.set({'lastfm_fail_id': id});
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'auth') {
    auth();
  }
  else if (message.type == 'session') {
    get_session_id(sendResponse);
  }
});
