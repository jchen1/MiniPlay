/* eslint-disable camel-case */

const api_key = '2aa5bd89dfc1b94205cc65b55556ef0e';
const api_secret = '80bec7945eb422b6030391d85896174a';
const apiUrl = 'http://ws.audioscrobbler.com/2.0/';

function getSignature(params) {
  const keys = Object.keys(params);
  let string = '';

  keys.sort();
  keys.forEach(key => {
    string += key + params[key];
  });

  string += api_secret;

  return MD5(string);
}

function getQueryString(params) {
  const parts = [];
  const keys = [];
  let o = '';

  for (const x in params) {
    parts.push(`${x}=${encodeURIComponent(params[x])}`);
    keys.push(x);
  }

  keys.sort();

  for (i = 0; i < keys.length; i++) {
    if (keys[i] === 'format' || keys[i] === 'callback') {
      continue;
    }
    o = o + keys[i] + params[keys[i]];
  }

  return `?${parts.join('&')}&api_sig=${
         getSignature(params)}`;
}

function failAuth() {
  chrome.notifications.create('lastfm_fail',
    {
      type: 'basic',
      title: 'Last.fm authentication failed!',
      message: 'Click here to reauthenticate.',
      iconUrl: '../img/icon-128.png'
    }, id => {
      chrome.storage.local.set({ lastfm_fail_id: id });
    });
}

function failScrobble(msg) {
  chrome.notifications.create('lastfm_failScrobble',
    {
      type: 'basic',
      title: 'Last.fm scrobbling failed!',
      message: msg,
      iconUrl: '../img/icon-128.png'
    }, id => {
      chrome.storage.local.set({ lastfm_fail_id: id });
    });
}

function auth() {
  const params = {
    method: 'auth.gettoken',
    api_key,
  };

  $.get(apiUrl + getQueryString(params), data => {
    if ($(data).find('lfm').attr('status') === 'ok') {
      const token = $(data).find('token').text();
      chrome.storage.sync.set({ lastfm_token: token });
      chrome.tabs.create(
        {
          url: `https://www.last.fm/api/auth/?api_key=${api_key}&token=${token}`
        });
    } else {
      chrome.storage.sync.remove('lastfm_token');
    }
  });
}

function getSessionId(cb) {
  chrome.storage.sync.get(['lastfm_token', 'lastfm_sessionID'], data => {
    if (data.lastfm_token === undefined) {
      auth();
      cb('');
    } else if (data.lastfm_sessionID !== undefined && data.lastfm_sessionID.length > 0) {
      cb(data.lastfm_sessionID);
    } else {
      const params = {
        method: 'auth.getsession',
        api_key,
        token: data.lastfm_token
      };
      $.get(apiUrl + getQueryString(params), xml => {
        if ($(xml).find('lfm').attr('status') === 'ok') {
          const key = $(xml).find('key').text();
          chrome.storage.sync.set({ lastfm_sessionID: key });
          cb(key);
        } else {
          chrome.storage.sync.remove('lastfm_sessionID');
          auth();
          cb('');
        }
      });
    }
  });
}

function nowPlaying(details) {
  chrome.storage.sync.get('scrobbling-enabled', response => {
    if (response['scrobbling-enabled'] === true && !(details === undefined || details.title === '')) {
      getSessionId(sessionId => {
        if (sessionId !== '') {
          const params = {
            method: 'track.updateNowPlaying',
            artist: details.artist,
            track: details.title,
            album: details.album,
            sk: sessionId,
            api_key
          };
          params.api_sig = getSignature(params);
          $.post(apiUrl, params).error(data => {
            const status = $(data).find('lfm').attr('status');
            if (status !== 'ok') {
              const code = $(data.responseXML).find('error').attr('code');
              if (code === '9' || code === '4') {
                failAuth();
              } else {
                failScrobble($(data.responseXML).find('error').text());
              }
            }
          });
        } else {
          failAuth();
        }
      });
    }
  });
}

function scrobble(details) {
  chrome.storage.sync.get('scrobbling-enabled', response => {
    if (response['scrobbling-enabled'] === true) {
      if (details === undefined || details.title === '') {
        return;
      }

      if (details.total_time_s > 30 && (details.current_time_s >= 240
          || 2 * details.current_time_s >= details.total_time_s)) {
        getSessionId(sessionId => {
          if (sessionId !== '') {
            const params = {
              method: 'track.scrobble',
              'artist[0]': details.artist,
              'track[0]': details.title,
              'timestamp[0]': Math.round((new Date().getTime() / 1000) - details.total_time_s),
              'album[0]': details.album,
              sk: sessionId,
              api_key
            };
            params.api_sig = getSignature(params);

            $.post(apiUrl, params).error(data => {
              const status = $(data.responseXML).find('lfm').attr('status');
              if (status !== 'ok') {
                const code = $(data.responseXML).find('error').attr('code');
                if (code === '9' || code === '4') {
                  failAuth();
                } else {
                  failScrobble($(data.responseXML).find('error').text());
                }
              }
            });
          } else {
            failAuth();
          }
        });
      }
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'auth') {
    auth();
  } else if (message.type === 'session') {
    getSessionId(sendResponse);
  }
});
