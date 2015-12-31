// Interfaces with the Google Play Music tab
var load_listeners = [];
var history_funcs = [];

var artist_map = [
{
  name: 'name',
  selector: 'a',
  property: 'innerText',
  if_null: ''
},
{
  name: 'id',
  attribute: 'data-id'
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  // TODO: placeholder artist image
  if_null: 'img/default_album.png'
}];

var album_map = [
{
  name: 'title',
  selector: '.title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'artist',
  selector: '.sub-title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'id',
  attribute: 'data-id'
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_album.png'
}];

var station_map = [
{
  name: 'title',
  selector: '.title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_album.png'
}];

var recent_map = [
{
  name: 'title',
  selector: '.title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'subtitle',
  selector: '.sub-title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_album.png'
}];

var playlist_map = [
{
  name: 'title',
  selector: '.title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_album.png'
}];

function update_slider(position, slidername) {  //position is in %
  var slider = document.getElementById(slidername).getElementsByTagName('paper-progress')[0];

  var newWidth = Math.round(position * slider.offsetWidth);
  var rect = slider.getBoundingClientRect();

  slider.dispatchEvent(new MouseEvent('mousedown', {
    clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
    clientY: rect.top + slider.clientTop - slider.scrollTop
  }));
}

function send_command(message) {
  var $button = null;
  switch (message.type) {
    case 'play':
      $button = $('paper-icon-button[data-id="play-pause"]');
      break;
    case 'rew':
      $button = $('paper-icon-button[data-id="rewind"]'); break;
    case 'ff':
      $button = $('paper-icon-button[data-id="forward"]'); break;
    case 'up':
      $button = $('paper-icon-button[data-rating="5"]'); break;
    case 'down':
      $button = $('paper-icon-button[data-rating="1"]'); break;
    case 'shuffle':
      $button = $('paper-icon-button[data-id="shuffle"]'); break;
    case 'repeat':
      $button = $('paper-icon-button[data-id="repeat"]'); break;
    case 'slider':
      update_slider(message.position, 'material-player-progress'); break;
    case 'vslider':
      update_slider(message.position, 'material-vslider'); break;
    case 'playlist':
      $button = $('.song-table > tbody > .song-row[data-index="'+message.index+'"] > td[data-col="song-details"] button'); break;
    case 'playlist-button':
      // Toggle the playlist to set it up for viewing
      if (!$('#queue-overlay').hasClass('sj-opened')) {
        $('#queue').click();
        window.setTimeout(function() {
          $('#queue').click();
        }, 100);
      }
      break;
  }
  if ($button !== null) {
    $button.click();
  }
  window.setTimeout( function() {
    update();
  }, 30);
}

function go_to_url(url, callback) {
  var hash_index = window.location.href.search('#');
  if (window.location.href.substring(hash_index) != url) {
    document.getElementById('loading-overlay').style.display = "block";

    load_listeners.push({
      callback: callback,
      called: false
    });

    window.location.href = window.location.href.substring(0, hash_index) + url;
  }
  else {
    callback();
  }
}

function click(selector, callback) {
  document.getElementById('loading-overlay').style.display = "block";

  load_listeners.push({
    callback: callback,
    called: false
  });

  if (document.querySelector(selector) == null) {
    console.log(selector);
  }
  document.querySelector(selector).click();
}

function parse_raw_data(raw_data, start_index, map) {
  var data = [];
  for (var i = 0; i < raw_data.length; i++) {
    var item = {};
    item.index = i + start_index;

    map.forEach(function (key) {
      if (key.selector) {
        item[key.name] = raw_data[i].querySelector(key.selector);
        item[key.name] = (item[key.name] == null) ? key.if_null : item[key.name][key.property];
      }
      else if (key.attribute) {
        item[key.name] = raw_data[i].getAttribute(key.attribute);
      }
    });

    data.push(item);
  }

  return data;
}

function restore_state(history, msg, cb) {
  var history = history.slice(0);

  if (history.length == 0) {
    cb(msg);
  }
  else {
    var next_state = history.shift();
    if (next_state.type == 'selector') {
      click(next_state.selector, function() {
        restore_state(history, msg, cb);
      });
    }
    else if (next_state.type == 'url') {
      go_to_url(next_state.url, function() {
        restore_state(history, msg, cb);
      });
    }
    else if (next_state.type == 'func') {
      history_funcs[next_state.id](function() {
        restore_state(history, msg, cb);
      });
    }
    else {
      console.log('bad state ' + next_state);
    }
  }
}

function get_artists(msg) {
  var history =
  [
    {
      type: 'url',
      url: '#/artists'
    }
  ];

  restore_state(history, msg, function(msg) {
    var cluster = document.querySelector('.material-card-grid');
    var desired_start_index = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count')));

    var cards = document.querySelectorAll('.lane-content > .material-card');
    var scroll_step = cards[parseInt(cluster.getAttribute('data-col-count'))].offsetTop;
    var observer = null;

    var parse_data = function() {
      var raw_artists = document.querySelectorAll('.lane-content > .material-card');
      var offset = cluster.getAttribute('data-col-count') * cluster.getAttribute('data-start-index');
      var artists = parse_raw_data(raw_artists, offset, artist_map);

      if (popup_port) {
        popup_port.postMessage({
          type: 'artists',
          data: artists,
          offset: offset,
          count: parseInt(document.querySelector('#countSummary').innerText)
        });
      }

      if (observer != null) observer.disconnect();
    }

    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-start-index') {
          var current_idx = cluster.getAttribute('data-start-index');

          if (cluster.getAttribute('data-end-index') != cluster.getAttribute('data-row-count') &&
                 desired_start_index != current_idx) {
            document.querySelector('#mainContainer').scrollTop += scroll_step;
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('scroll', false, true);
            document.getElementById('mainContainer').dispatchEvent(evt);
          }

          else {
            parse_data();
          }
        }
      });
    });

    observer.observe(cluster, {attributes: true});

    cluster.setAttribute('data-start-index', '1');
    document.querySelector('#mainContainer').scrollTop = 0;
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('scroll', false, true);
    document.getElementById('mainContainer').dispatchEvent(evt);

  });
}

function get_albums(msg) {
  var history = [
  {
    type: 'url',
    url: '#/albums'
  }];

  restore_state(history, msg, function(msg) {
    var cluster = document.querySelector('.material-card-grid');
    var desired_start_index = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count')));

    var cards = document.querySelectorAll('.lane-content > .material-card');
    var scroll_step = (desired_start_index > 0 ? cards[parseInt(cluster.getAttribute('data-col-count'))].offsetTop : 0);
    var observer = null;

    var parse_data = function() {
      var raw_albums = document.querySelectorAll('.lane-content > .material-card');
      var start_offset = cluster.getAttribute('data-col-count') * cluster.getAttribute('data-start-index');
      var albums = parse_raw_data(raw_albums, start_offset, album_map);

      if (popup_port) {
        popup_port.postMessage({
          type: 'albums',
          data: albums,
          offset: start_offset,
          count: parseInt(document.querySelector('#countSummary').innerText),
          history: history
        });
      }
      if (observer != null) observer.disconnect();
    }

    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-start-index') {

          var current_idx = cluster.getAttribute('data-start-index');

          if (cluster.getAttribute('data-end-index') != cluster.getAttribute('data-row-count') &&
                 desired_start_index != current_idx) {
            document.querySelector('#mainContainer').scrollTop += scroll_step;
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('scroll', false, true);
            document.getElementById('mainContainer').dispatchEvent(evt);
          }

          else {
            parse_data();
          }
        }
      });
    });

    observer.observe(cluster, {attributes: true});

    cluster.setAttribute('data-start-index', '1');
    document.querySelector('#mainContainer').scrollTop = 0;
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('scroll', false, true);
    document.getElementById('mainContainer').dispatchEvent(evt);
  });
}

function get_stations(msg) {
  var history =
  [
    {
      type: 'url',
      url: '#/wms'
    }
  ];

  restore_state(history, msg, function(msg) {
    var raw_recent_stations = document.querySelectorAll('.g-content .my-recent-stations-cluster-wrapper .lane-content .material-card');
    var raw_my_stations = document.querySelectorAll('.g-content .section-header+.cluster .lane-content .material-card');

    var recent_stations = parse_raw_data(raw_recent_stations, 0, station_map);
    var my_stations = parse_raw_data(raw_my_stations, 0, station_map);

    var stations = {
      recent_stations: recent_stations,
      my_stations: my_stations
    };

    if (popup_port) {
      popup_port.postMessage({
        type: 'stations',
        data: stations,
        history: history
      });
    }
  });
}

function get_album_art(art) {
  return (!art || art == 'http://undefined') ? 'img/default_album.png' : art.substring(0, art.search('=') + 1) + 's320';
}

function get_time(time) {
  return time.split(':').map(function(num, index, arr) {
    return parseInt(num, 10) * Math.pow(60, arr.length - index - 1);
  }).reduce(function(a, b) { return a + b; });
}

function get_recent(msg) {
  var history = [
  {
    type: 'url',
    url: '#/now'
  }];

  restore_state(history, msg, function(msg) {
    var raw_recent = document.querySelectorAll('.cluster[data-type="recent"] .material-card');

    var recent = parse_raw_data(raw_recent, 0, recent_map);

    if (popup_port) {
      popup_port.postMessage({
        type: 'recent',
        data: recent,
        history: history
      });
    }
  });
}

function get_search(msg) {
  var history = [
  {
    type: 'url',
    url: '#/sr/'+encodeURIComponent(msg.query)
  }];
  restore_state(history, msg, function(msg) {
    var artists = [], albums = [], songs = [];

    var raw_artists = document.querySelectorAll('.cluster[data-type="srar"] .material-card');
    var raw_albums = document.querySelectorAll('.cluster[data-type="sral"] .material-card');
    var raw_songs = document.querySelectorAll('.cluster[data-type="srs"] .material-card');

  });
}

// TODO: use all four images in the playlist instead of just one
function get_playlists(msg) {
  var history = [
    {
      type: 'url',
      url: '#/wmp'
    }
  ];

  restore_state(history, msg, function(msg) {
    var recent_playlists = [], auto_playlists = [], my_playlists = [];

    var raw_playlists = document.querySelectorAll('.g-content .cluster');

    var raw_recent_playlists = raw_playlists[0].querySelectorAll('.lane-content .material-card');
    var raw_auto_playlists = raw_playlists[1].querySelectorAll('.lane-content .material-card');

    recent_playlists = parse_raw_data(raw_recent_playlists, 0, playlist_map);
    auto_playlists = parse_raw_data(raw_auto_playlists, 0, playlist_map);

    var cluster = document.querySelector('.material-card-grid');
    var desired_start_index = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count')));

    var cards = cluster.querySelectorAll('.lane-content > .material-card');
    var scroll_step = (desired_start_index > 0 ? cards[parseInt(cluster.getAttribute('data-col-count'))].offsetTop : 0);
    var observer = null;

    var parse_data = function() {
      var raw_my_playlists = raw_playlists[2].querySelectorAll('.lane-content .material-card');
      var start_offset = cluster.getAttribute('data-col-count') * cluster.getAttribute('data-start-index');
      my_playlists = parse_raw_data(raw_my_playlists, start_offset, playlist_map);

      var playlists = {
        recent_playlists: recent_playlists,
        auto_playlists: auto_playlists,
        my_playlists: my_playlists
      }

      if (popup_port) {
        popup_port.postMessage({
          type: 'playlists',
          data: playlists,
          offset: start_offset,
          count: parseInt(document.querySelector('#countSummary').innerText),
          history: history
        });
      }
      if (observer != null) observer.disconnect();
    }

    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-start-index') {
          var current_idx = cluster.getAttribute('data-start-index');

          if (cluster.getAttribute('data-end-index') != cluster.getAttribute('data-row-count') &&
                 desired_start_index != current_idx) {
            document.querySelector('#mainContainer').scrollTop += scroll_step;
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('scroll', false, true);
            document.getElementById('mainContainer').dispatchEvent(evt);
          }

          else {
            parse_data();
          }
        }
      });
    });

    observer.observe(cluster, {attributes: true});
    // TODO: is this enough?? (probably not since my stations starts pretty low)
    // testing requires making like a billion new playlists though

    cluster.setAttribute('data-start-index', '1');
    document.querySelector('#mainContainer').scrollTop = 0;
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('scroll', false, true);
    document.getElementById('mainContainer').dispatchEvent(evt);
  });
}

function data_click(msg) {
  restore_state(msg.history, msg, function(msg) {
    if (msg.click_type == 'album') {

      var parse_album = function() {
        var raw_songs = document.querySelectorAll('#music-content .song-table .song-row');
        var songs = [];
        for (var i = 0; i < raw_songs.length; i++) {
          var song = {};

          song.index = i;

          song.title = raw_songs[i].querySelector('td[data-col="title"] span');
          song.title = song.title == null ? "" : song.title.innerText;

          song.artist = raw_songs[i].querySelector('td[data-col="artist"] span a');
          song.artist = song.artist == null ? "" : song.artist.innerText;

          song.album = raw_songs[i].querySelector('td[data-col="album"] span a');
          song.album = song.album == null ? "" : song.album.innerText;

          song.album_art = raw_songs[i].querySelector('td[data-col="title"] span img');
          song.album_art = song.album_art == null ? "img/default_album.png" : song.album_art.src;

          song.total_time = raw_songs[i].querySelector('td[data-col="duration"] span');
          song.total_time = song.total_time == null ? "0:00" : song.total_time.innerText;
          song.total_time_s = get_time(song.total_time);

          song.play_count = raw_songs[i].querySelector('td[data-col="play-count"] span');
          song.play_count = song.play_count == null ? "" : song.play_count.innerText;

          song.currently_playing = raw_songs[i].classList.contains('currently-playing');

          songs.push(song);
        }
        if (popup_port) {
          popup_port.postMessage({
            type: 'playlist',
            data: songs,
            history: [{
              type: 'url',
              url: window.location.href.substring(window.location.href.search('#'))
            }]
          });
        }
      };

      var cluster = document.querySelector('.material-card-grid');
      var desired_start_index = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count')));

      var cards = document.querySelectorAll('.lane-content > .material-card');
      var scroll_step = cards[parseInt(cluster.getAttribute('data-col-count')) * 2].offsetTop -
                        cards[parseInt(cluster.getAttribute('data-col-count'))].offsetTop + 4;

      var selector = '#music-content .lane-content > .material-card[data-id="' + msg.id + '"]';
      var observer = null;

      document.querySelector('#mainContainer').scrollTop = 0;
      var evt = document.createEvent('HTMLEvents');
      evt.initEvent('scroll', false, true);
      document.getElementById('mainContainer').dispatchEvent(evt);

      var get_album = function() {
        var raw_albums = document.querySelectorAll('.lane-content > .material-card');
        var offset = msg.offset - desired_start_index * parseInt(cluster.getAttribute('data-col-count'));

        click(selector, parse_album);

        if (observer != null) observer.disconnect();
      }

      if (desired_start_index >= cluster.getAttribute('data-end-index')) {
        observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-start-index') {
              var current_idx = cluster.getAttribute('data-start-index');

              if (cluster.getAttribute('data-end-index') != cluster.getAttribute('data-row-count') &&
                  document.querySelector(selector) == null) {
                document.querySelector('#mainContainer').scrollTop += scroll_step;
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('scroll', false, true);
                document.getElementById('mainContainer').dispatchEvent(evt);
              }

              else {
                get_album();
              }
            }
          });
        });

        observer.observe(cluster, {attributes: true});

        cluster.setAttribute('data-start-index', '1');
        document.querySelector('#mainContainer').scrollTop = 0;
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('scroll', false, true);
        document.getElementById('mainContainer').dispatchEvent(evt);
      }
      else {
        get_album();
      }
    }

    else if (msg.click_type == 'playlist') {
      document.querySelector('.song-table > tbody > .song-row[data-index="'+msg.index+'"] button').click();

      window.setTimeout( function() {
        update();
      }, 30);
    }

    else if (msg.click_type == 'playlists') {
      var idx = 0;
      switch (msg.playlist_type) {
        case 'recent_playlist': idx = 0; break;
        case 'auto_playlist': idx = 1; break;
        case 'my_playlist': idx = 2; break;
      }
      var raw_playlists = document.querySelectorAll('.g-content .cluster')[idx].querySelectorAll('.lane-content .material-card');

      if (msg.playlist_type != 'my_playlist') {
        raw_playlists[msg.index].querySelector('.play-button-container').click();
      }
      else {
        // TODO because scrolling :(
      }
    }

    else if (msg.click_type == 'recent') {
      document.querySelector('.cluster[data-type="recent"] .material-card[data-log-position="'+msg.index+'"] .play-button-container').click();

      window.setTimeout( function() {
        update();
      }, 30);
    }

    else if (msg.click_type == 'station') {
      var stations;
      if (msg.station_type == 'my_station') {
        stations = document.querySelectorAll('.g-content .section-header+.cluster .lane-content .material-card');
      }
      else if (msg.station_type == 'recent_station') {
        stations = document.querySelectorAll('.g-content .my-recent-stations-cluster-wrapper .lane-content .material-card');
      }
      stations[msg.index].querySelector('.play-button-container').click();

      window.setTimeout( function() {
        update();
      }, 30);
    }
  });
}

$(function() {
  route('get_artists', get_artists);
  route('get_albums', get_albums);
  route('get_playlists', get_playlists);
  route('get_stations', get_stations);
  route('get_recent', get_recent);
  route('get_search', get_search);
  route('data_click', data_click);
  route('send_command', send_command);

  var trigger = document.getElementById('loading-overlay');
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'style' &&
          window.getComputedStyle(trigger).getPropertyValue('display') === 'none') {

        load_listeners.forEach(function(listener) {
          if (listener.called === false) {
            listener.called = true;
            listener.callback();
          }
        });

        load_listeners = load_listeners.filter(function(listener) {
          return listener.called === false;
        });
      }
    });
  });

  observer.observe(trigger, {attributes: true});
});
