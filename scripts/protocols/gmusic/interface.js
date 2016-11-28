// Interfaces with the Google Play Music tab
let loadListeners = [];
const historyFuncs = [];

function updateSlider(position, slidername) {  // position is in %
  const slider = document.getElementById(slidername).getElementsByTagName('paper-progress')[0];

  const newWidth = Math.round(position * slider.offsetWidth);
  const rect = slider.getBoundingClientRect();

  slider.dispatchEvent(new MouseEvent('mousedown', {
    clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
    clientY: rect.top + slider.clientTop - slider.scrollTop
  }));
}

function sendCommand(message) {
  let button = null;
  switch (message.type) {
    case 'play':
      button = document.querySelector('#player paper-icon-button[data-id="play-pause"]');
      break;
    case 'rew':
      button = document.querySelector('#player paper-icon-button[data-id="rewind"]'); break;
    case 'ff':
      button = document.querySelector('#player paper-icon-button[data-id="forward"]'); break;
    case 'up':
      button = document.querySelector('#player paper-icon-button[data-rating="5"]'); break;
    case 'down':
      button = document.querySelector('#player paper-icon-button[data-rating="1"]'); break;
    case 'shuffle':
      button = document.querySelector('#player paper-icon-button[data-id="shuffle"]'); break;
    case 'repeat':
      button = document.querySelector('#player paper-icon-button[data-id="repeat"]'); break;
    case 'slider':
      updateSlider(message.position, 'material-player-progress'); break;
    case 'vslider':
      updateSlider(message.position, 'material-vslider'); break;
    case 'playlist':
      button = document.querySelector(`.song-table > tbody > .song-row[data-id="${message.id}"] > td[data-col="song-details"] button`); break;
    case 'playlist-button':
      // Toggle the playlist to set it up for viewing
      if (!document.querySelector('#queue-overlay').classList.contains('sj-opened')) {
        document.querySelector('#queue').click();
        window.setTimeout(() => {
          document.querySelector('#queue').click();
        }, 100);
      }
      break;
    default:
      break;
  }
  if (button !== null) {
    button.click();
  }
  window.setTimeout(() => {
    update();
  }, 30);
}

function goToUrl(url, callback) {
  const hashIndex = window.location.href.search('#');
  if (window.location.href.substring(hashIndex) !== url) {
    document.getElementById('loading-overlay').style.display = 'block';

    loadListeners.push({
      callback,
      called: false
    });

    window.location.href = window.location.href.substring(0, hashIndex) + url;
  } else {
    callback();
  }
}

function click(selector, callback) {
  document.getElementById('loading-overlay').style.display = 'block';

  loadListeners.push({
    callback,
    called: false
  });

  if (document.querySelector(selector) === null) {
    console.log(selector);
  }
  document.querySelector(selector).click();
}

function parseRawData(rawData, startIndex, map) {
  const data = [];
  for (let i = 0; i < rawData.length; i++) {
    const item = {};
    item.index = i + startIndex;

    map.forEach(key => {
      if (key.selector) {
        item[key.name] = rawData[i].querySelector(key.selector);
        item[key.name] = (item[key.name] === null) ? key.if_null : item[key.name][key.property];
      } else if (key.attribute) {
        item[key.name] = rawData[i].getAttribute(key.attribute);
      }
    });

    data.push(item);
  }

  return data;
}

function restoreState(history, msg, cb) {
  history = history.slice(0);

  if (history.length === 0) {
    cb(msg);
  } else {
    const nextState = history.shift();
    if (nextState.type === 'selector') {
      click(nextState.selector, () => {
        restoreState(history, msg, cb);
      });
    } else if (nextState.type === 'url') {
      goToUrl(nextState.url, () => {
        restoreState(history, msg, cb);
      });
    } else if (nextState.type === 'func') {
      historyFuncs[nextState.id](() => {
        restoreState(history, msg, cb);
      });
    } else {
      console.log(`bad state ${nextState}`);
    }
  }
}

function scrollToIndex(cluster, desiredStartIndex, cb) {
  const cards = document.querySelectorAll('.lane-content > .material-card');
  const scrollStep = (desiredStartIndex > 0 ? cards[parseInt(cluster.getAttribute('data-col-count'), 10)].offsetTop - cards[0].offsetTop : 0);
  const scrollEvent = document.createEvent('HTMLEvents');
  scrollEvent.initEvent('scroll', false, true);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'data-start-index') {
        const currentIdx = parseInt(cluster.getAttribute('data-start-index'), 10);
        if (cluster.getAttribute('data-end-index') !== cluster.getAttribute('data-row-count') &&
            desiredStartIndex !== currentIdx) {
          document.querySelector('#mainContainer').scrollTop += scrollStep;
          document.querySelector('#mainContainer').dispatchEvent(scrollEvent);
        } else {
          cb(observer);
        }
      }
    });
  });

  observer.observe(cluster, { attributes: true });

  cluster.setAttribute('data-start-index', cluster.getAttribute('data-end-index') + 1);
  document.querySelector('#mainContainer').scrollTop = 0;
  document.querySelector('#mainContainer').dispatchEvent(scrollEvent);

  return observer;
}

function getArtists(m) {
  const history =
    [
      {
        type: 'url',
        url: '#/artists'
      }
    ];

  restoreState(history, m, msg => {
    const cluster = document.querySelector('.material-card-grid');
    const desiredStartIndex = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count'), 10));

    const cards = document.querySelectorAll('.lane-content > .material-card');
    const scrollStep = (desiredStartIndex > 0 ? cards[parseInt(cluster.getAttribute('data-col-count'), 10)].offsetTop : 0);

    const parseData = function(observer) {
      const rawArtists = document.querySelectorAll('.lane-content > .material-card');
      const offset = cluster.getAttribute('data-col-count') * cluster.getAttribute('data-start-index');
      const artists = parseRawData(rawArtists, offset, artistMap);

      if (popupPort) {
        popupPort.postMessage({
          type: 'artists',
          data: artists,
          offset,
          history,
          count: parseInt(document.querySelector('#countSummary').innerText, 10)
        });
      }

      if (observer !== null) observer.disconnect();
    };

    scrollToIndex(cluster, desiredStartIndex, parseData);
  });
}

function getAlbums(m) {
  const history = [
    {
      type: 'url',
      url: '#/albums'
    }];

  restoreState(history, m, msg => {
    const cluster = document.querySelector('.material-card-grid');
    const desiredStartIndex = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count'), 10));

    const cards = document.querySelectorAll('.lane-content > .material-card');
    const scrollStep = (desiredStartIndex > 0 ? cards[parseInt(cluster.getAttribute('data-col-count'), 10)].offsetTop - cards[0].offsetTop + 4 : 0);

    const parseData = function(observer) {
      const rawAlbums = document.querySelectorAll('.lane-content > .material-card');
      const startOffset = cluster.getAttribute('data-col-count') * cluster.getAttribute('data-start-index');
      const albums = parseRawData(rawAlbums, startOffset, albumMap);

      if (popupPort) {
        popupPort.postMessage({
          type: 'albums',
          data: albums,
          offset: startOffset,
          count: parseInt(document.querySelector('#countSummary').innerText, 10),
          history
        });
      }
      if (observer !== null) observer.disconnect();
    };

    scrollToIndex(cluster, desiredStartIndex, parseData);
  });
}

function getStations(m) {
  const history =
    [
      {
        type: 'url',
        url: '#/wms'
      }
    ];

  restoreState(history, m, msg => {
    const rawRecentStations = document.querySelectorAll('.g-content .my-recent-stations-cluster-wrapper .lane-content .material-card');
    const rawMyStations = document.querySelectorAll('.g-content .section-header+.cluster .lane-content .material-card');

    const recentStations = parseRawData(rawRecentStations, 0, stationMap);
    const myStations = parseRawData(rawMyStations, 0, stationMap);

    const stations = {
      recentStations,
      myStations
    };

    if (popupPort) {
      popupPort.postMessage({
        type: 'stations',
        data: stations,
        history
      });
    }
  });
}

function getAlbumArt(art) {
  return (!art || art === 'http://undefined') ? 'img/default_album.png' : `${art.substring(0, art.search('=') + 1)}s320`;
}

function getTime(time) {
  return time.split(':').map((num, index, arr) => parseInt(num, 10) * (60 ** (arr.length - index - 1))).reduce((a, b) => a + b);
}

function getRecent(m) {
  const history = [
    {
      type: 'url',
      url: '#/recents'
    }];

  restoreState(history, m, msg => {
    const rawRecent = document.querySelectorAll('.gpm-card-grid sj-card');

    const recent = parseRawData(rawRecent, 0, recentMap);

    if (popupPort) {
      popupPort.postMessage({
        type: 'recent',
        data: recent,
        history
      });
    }
  });
}

function search(m) {
  const history = [
    {
      type: 'url',
      url: `#/sr/${encodeURIComponent(m.query)}`
    }];
  restoreState(history, m, msg => {
    const rawArtists = document.querySelectorAll('.cluster[data-type="srar"] .material-card');
    const rawAlbums = document.querySelectorAll('.cluster[data-type="sral"] .material-card');
    const rawSongs = document.querySelectorAll('.cluster[data-type="srs"] .song-row');

    const artists = parseRawData(rawArtists, 0, artistMap);
    const albums = parseRawData(rawAlbums, 0, albumMap);
    const songs = parseRawData(rawSongs, 0, songMap);

    const searchData = {
      artists,
      albums,
      songs
    };

    if (popupPort) {
      popupPort.postMessage({
        type: 'search',
        data: searchData,
        history
      });
    }
  });
}

// TODO: use all four images in the playlist instead of just one
function getPlaylists(m) {
  const history = [
    {
      type: 'url',
      url: '#/wmp'
    }
  ];

  restoreState(history, m, msg => {
    let recentPlaylists = [];
    let autoPlaylists = [];
    let myPlaylists = [];

    const rawPlaylists = document.querySelectorAll('.g-content .cluster');

    const rawRecentPlaylists = rawPlaylists[0].querySelectorAll('.lane-content .material-card');
    const rawAutoPlaylists = rawPlaylists[1].querySelectorAll('.lane-content .material-card');

    recentPlaylists = parseRawData(rawRecentPlaylists, 0, playlistMap);
    autoPlaylists = parseRawData(rawAutoPlaylists, 0, playlistMap);

    const cluster = document.querySelector('.material-card-grid');
    const desiredStartIndex = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count'), 10));

    const cards = cluster.querySelectorAll('.lane-content > .material-card');
    const scrollStep = (desiredStartIndex > 0 ? cards[parseInt(cluster.getAttribute('data-col-count'), 10)].offsetTop - cards[0].offsetTop + 4 : 0);

    const parseData = function(observer) {
      const rawMyPlaylists = rawPlaylists[2].querySelectorAll('.lane-content .material-card');
      const startOffset = cluster.getAttribute('data-col-count') * cluster.getAttribute('data-start-index');
      myPlaylists = parseRawData(rawMyPlaylists, startOffset, playlistMap);

      const playlists = {
        recentPlaylists,
        autoPlaylists,
        myPlaylists
      };

      if (popupPort) {
        popupPort.postMessage({
          type: 'playlists',
          data: playlists,
          offset: startOffset,
          count: parseInt(document.querySelector('#countSummary').innerText, 10),
          history
        });
      }
      if (observer !== null) observer.disconnect();
    };

    // TODO: does the scroll work properly for playlists
    //       (playlists start scrolling later)
    scrollToIndex(cluster, desiredStartIndex, parseData);
  });
}

function dataClick(m) {
  restoreState(m.history, m, msg => {
    let url;
    if (msg.click_type === 'album') {
      url = `#/album/${msg.id}`;

      const parseAlbum = function() {
        const rawSongs = document.querySelectorAll('#music-content .song-table .song-row');
        const songs = parseRawData(rawSongs, 0, songMap);
        if (popupPort) {
          popupPort.postMessage({
            type: 'playlist',
            data: songs,
            history: [{
              type: 'url',
              url,
            }],
            title: document.querySelector('#mainContainer .title').firstChild.nodeValue,
            subtitle: document.querySelector('#mainContainer .creator-name').innerText
          });
        }
      };
      goToUrl(url, parseAlbum);
    } else if (msg.click_type === 'artist') {
      url = `#/artist/${msg.id}`;
      const parseArtist = function() {
        const rawSongs = document.querySelectorAll('#music-content .song-table .song-row');
        const rawAlbums = document.querySelectorAll('.cluster[data-type="saral"] .material-card');

        const songs = parseRawData(rawSongs, 0, songMap);
        const albums = parseRawData(rawAlbums, 0, albumMap);
        const artist = {
          songs,
          albums
        };

        if (popupPort) {
          popupPort.postMessage({
            type: 'artist',
            data: artist,
            history: [{
              type: 'url',
              url
            }],
            title: document.querySelector('#mainContainer .name').innerText
          });
        }
      };

      goToUrl(url, parseArtist);
    } else if (msg.click_type === 'playlist') {
      document.querySelector(`.song-table > tbody > .song-row[data-id="${msg.id}"] button`).click();

      window.setTimeout(() => {
        update();
      }, 30);
    } else if (msg.click_type === 'playlists') {
      let idx = 0;
      switch (msg.playlist_type) {
        case 'recent_playlist': idx = 0; break;
        case 'auto_playlist': idx = 1; break;
        case 'my_playlist': idx = 2; break;
        default: break;
      }
      const rawPlaylists = document.querySelectorAll('.g-content .cluster')[idx].querySelectorAll('.lane-content .material-card');

      if (msg.playlist_type !== 'my_playlist') {
        rawPlaylists[msg.index].querySelector('.play-button-container').click();
      } else {
        goToUrl(`#/pl/${msg.id}`, () => {
          document.querySelector('paper-fab[data-id="play"]').click();
          window.setTimeout(() => {
            update();
          }, 30);
        });
      }
    } else if (msg.click_type === 'recent') {
      // TODO do this without going to the album page...
      const card = document.querySelectorAll('gpm-card-grid sj-card')[msg.index];
      url = `${card.getAttribute('data-type')}/${card.getAttribute('data-id')}`;
      goToUrl(`#/${url}`, () => {
        document.querySelector('paper-fab[data-id="play"]').click();
        window.setTimeout(() => {
          update();
        }, 30);
      });
    } else if (msg.click_type === 'station') {
      let stations;
      if (msg.station_type === 'my_station') {
        stations = document.querySelectorAll('.g-content .section-header+.cluster .lane-content .material-card');
      } else if (msg.station_type === 'recent_station') {
        stations = document.querySelectorAll('.g-content .my-recent-stations-cluster-wrapper .lane-content .material-card');
      }
      stations[msg.index].querySelector('.play-button-container').click();

      window.setTimeout(() => {
        update();
      }, 30);
    }
  });
}

function init() {
  route('getArtists', getArtists);
  route('getAlbums', getAlbums);
  route('getPlaylists', getPlaylists);
  route('getStations', getStations);
  route('getRecent', getRecent);
  route('search', search);
  route('dataClick', dataClick);
  route('sendCommand', sendCommand);

  const trigger = document.getElementById('loading-overlay');
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'style' &&
          window.getComputedStyle(trigger).getPropertyValue('display') === 'none') {
        loadListeners.forEach(listener => {
          if (listener.called === false) {
            listener.called = true;
            listener.callback();
          }
        });

        loadListeners = loadListeners.filter(listener => listener.called === false);
      }
    });
  });

  observer.observe(trigger, { attributes: true });
}

document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') {
  init();
}
