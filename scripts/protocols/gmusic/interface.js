// Interfaces with the Google Play Music tab
var load_listeners = [];

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

function click(selector, callback) {
  load_listeners.push({
    callback: callback,
    called: false
  });

  document.getElementById('loading-overlay').style.display = "block";
  document.querySelector(selector).click();
}

function get_artists(msg) {
  click('a[data-type="my-library"]', function() {
    click('paper-tab[data-type="artists"]', function() {
      var cluster = document.querySelector('.material-card-grid');
      var desired_start_index = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count')));

      var cards = document.querySelectorAll('.lane-content > .material-card');
      var scroll_step = cards[parseInt(cluster.getAttribute('data-col-count'))].offsetTop;
      var observer = null;

      var parse_artists = function() {
        var raw_artists = document.querySelectorAll('.lane-content > .material-card');
        var artists = [];
        for (var i = 0; i < raw_artists.length; i++) {
          var artist = {};
          artist.id = raw_artists[i].getAttribute('data-id');
          if (!artist.id) continue;

          artist.name = raw_artists[i].querySelector('a');
          artist.name = artist.name == null ? "" : artist.name.innerText;

          // TODO: placeholder artist image
          artist.image = raw_artists[i].querySelector('img');
          artist.image = artist.image == null ? "img/default_album.png" : artist.image.src;

          artists.push(artist);
        }

        if (popup_port) {
          popup_port.postMessage({
            'type': 'artists',
            'data': artists,
            'offset': cluster.getAttribute('data-col-count') * cluster.getAttribute('data-start-index'),
            'count': parseInt(document.querySelector('#countSummary').innerText)
          });
        }

        if (observer != null) observer.disconnect();
      }

      if (desired_start_index != 0) {
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
                parse_artists();
              }
            }
          });
        });

        observer.observe(cluster, {attributes: true});
        document.querySelector('#mainContainer').scrollTop += scroll_step;
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('scroll', false, true);
        document.getElementById('mainContainer').dispatchEvent(evt);
      }
      else {
        parse_artists();
      }
    });
  });
}

function get_albums(msg) {
  click('a[data-type="my-library"]', function() {
    click('paper-tab[data-type="albums"]', function() {
      var cluster = document.querySelector('.material-card-grid');
      var desired_start_index = Math.floor(msg.offset / parseInt(cluster.getAttribute('data-col-count')));

      var cards = document.querySelectorAll('.lane-content > .material-card');
      var scroll_step = cards[parseInt(cluster.getAttribute('data-col-count'))].offsetTop;
      var observer = null;

      var parse_albums = function() {
        var raw_albums = document.querySelectorAll('.lane-content > .material-card');
        var albums = [];
        for (var i = 0; i < raw_albums.length; i++) {
          var album = {};
          album.title = raw_albums[i].querySelector('.title');
          album.title = album.title == null ? "" : album.title.innerText;

          album.artist = raw_albums[i].querySelector('.sub-title');
          album.artist = album.artist == null ? "" : album.artist.innerText;

          album.image = raw_albums[i].querySelector('img');
          album.image = album.image == null ? "img/default_album.png" : album.image.src;

          albums.push(album);
        }

        if (popup_port) {
          popup_port.postMessage({
            'type': 'albums',
            'data': albums,
            'offset': cluster.getAttribute('data-col-count') * cluster.getAttribute('data-start-index'),
            'count': parseInt(document.querySelector('#countSummary').innerText)
          });
        }
        if (observer != null) observer.disconnect();
      }

      if (desired_start_index != 0) {
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
                parse_albums();
              }
            }
          });
        });

        observer.observe(cluster, {attributes: true});
        document.querySelector('#mainContainer').scrollTop += scroll_step;
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('scroll', false, true);
        document.getElementById('mainContainer').dispatchEvent(evt);
      }
      else {
        parse_albums();
      }
    });
  });
}

function get_songs() {
  click('a[data-type="my-library"]', function() {
    click('paper-tab[data-type="all"]', function() {
      // TODO: figure out how to do this right
    });
  });
}

function get_genres() {
  click('a[data-type="my-library"]', function() {
    click('paper-tab[data-type="genres"]', function() {
      var raw_genres = document.querySelectorAll('.lane-content > .material-card');
      var genres = [];
      for (var i = 0; i < raw_genres.length; i++) {
        var genre = {};
        genre.title = raw_genres[i].querySelector('.title');
        genre.title = genre.title == null ? "" : genre.title.innerText;

        var subtitle = raw_genres[i].querySelector('.sub-title');
        subtitle = subtitle == null ? " · " : subtitle.innerText;

        genre.album_count = parseInt(subtitle.split(' · ')[0]);
        genre.song_count = parseInt(subtitle.split(' · ')[1]);

        genres.push(genre);
      }

      console.log(genres);
      if (popup_port) {
        popup_port.postMessage({
          'type': 'genres',
          'data': genres
        })
      }
    });
  });
}

function get_stations() {
  click('a[data-type="my-library"]', function() {
    click('paper-tab[data-type="wms"]', function() {
      var raw_recent_stations = document.querySelectorAll('.g-content .my-recent-stations-cluster-wrapper .lane-content .material-card');
      var raw_my_stations = document.querySelectorAll('.g-content .section-header+.cluster .lane-content .material-card');

      var recent_stations = [];
      var my_stations = [];

      for (var i = 0; i < raw_recent_stations.length; i++) {
        var station = {};
        station.title = raw_recent_stations[i].querySelector('.title');
        station.title = station.title == null ? "" : station.title.innerText;

        station.image = raw_recent_stations[i].querySelector('img');
        station.image = station.image == null ? "img/default_album.png" : station.image.src;

        recent_stations.push(station);
      }

      for (var i = 0; i < raw_my_stations.length; i++) {
        var station = {};
        station.title = raw_my_stations[i].querySelector('.title');
        station.title = station.title == null ? "" : station.title.innerText;

        station.image = raw_my_stations[i].querySelector('img');
        station.image = station.image == null ? "img/default_album.png" : station.image.src;

        my_stations.push(station);
      }

      var stations = {
        'recent_stations': recent_stations,
        'my_stations': my_stations
      };

      console.log(stations);
      if (popup_port) {
        popup_port.postMessage({
          'type': 'stations',
          'data': stations
        })
      }
    });
  });
}

function get_album_art(art) {
  return (!art || art == 'http://undefined') ? 'img/default_album.png' : art.substring(0, art.search('=') + 1) + 's320';
}

// TODO: do this lol
function get_playlists() {
  click('a[data-type="my-library"]', function() {
    console.log('library!');
    click('paper-tab[data-type="wmp"]', function() {
      console.log('playlists!');
    });
  });
}

$(function() {
  route('get_artists', get_artists);
  route('get_albums', get_albums);
  route('get_genres', get_genres);
  route('get_playlists', get_playlists);
  route('get_songs', get_songs);
  route('get_stations', get_stations);
  route('send_command', send_command);

  var trigger = document.getElementById('loading-overlay');
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'style' &&
          window.getComputedStyle(trigger).getPropertyValue('display') === 'none') {

        load_listeners.forEach(function(listener) {
          if (listener.called === false) {
            listener.callback();
            listener.called = true;
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
