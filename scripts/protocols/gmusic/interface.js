// Interfaces with the Google Play Music tab
var load_listeners = [];
var history_funcs = [];

function update_slider(position, slidername) {
  //position is in %
  var slider = document
    .getElementById(slidername)
    .getElementsByTagName("paper-progress")[0];

  var newWidth = Math.round(position * slider.offsetWidth);
  var rect = slider.getBoundingClientRect();

  slider.dispatchEvent(
    new MouseEvent("mousedown", {
      clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
      clientY: rect.top + slider.clientTop - slider.scrollTop,
    })
  );
}

function send_command(message) {
  var button = null;
  switch (message.type) {
    case "play":
      button = document.querySelector(
        'paper-icon-button[data-id="play-pause"]'
      );
      break;
    case "rew":
      button = document.querySelector('paper-icon-button[data-id="rewind"]');
      break;
    case "ff":
      button = document.querySelector('paper-icon-button[data-id="forward"]');
      break;
    case "up":
      button = document.querySelector('paper-icon-button[data-rating="5"]');
      break;
    case "down":
      button = document.querySelector('paper-icon-button[data-rating="1"]');
      break;
    case "shuffle":
      button = document.querySelector('paper-icon-button[data-id="shuffle"]');
      break;
    case "repeat":
      button = document.querySelector('paper-icon-button[data-id="repeat"]');
      break;
    case "slider":
      update_slider(message.position, "material-player-progress");
      break;
    case "vslider":
      update_slider(message.position, "material-vslider");
      break;
    case "playlist":
      button = document.querySelector(
        '.song-table > tbody > .song-row[data-id="' +
          message.id +
          '"] > td[data-col="song-details"] button'
      );
      break;
    case "playlist-button":
      // Toggle the playlist to set it up for viewing
      if (
        !document
          .querySelector("#queue-overlay")
          .classList.contains("sj-opened")
      ) {
        document.querySelector("#queue").click();
        window.setTimeout(function () {
          document.querySelector("#queue").click();
        }, 100);
      }
      break;
  }
  if (button !== null) {
    button.click();
  }
  window.setTimeout(function () {
    update();
  }, 30);
}

function go_to_url(url, callback) {
  var hash_index = window.location.href.search("#");
  if (window.location.href.substring(hash_index) != url) {
    document.getElementById("loading-overlay").style.display = "block";

    load_listeners.push({
      callback: callback,
      called: false,
    });

    window.location.href = window.location.href.substring(0, hash_index) + url;
  } else {
    callback();
  }
}

function click(selector, callback) {
  document.getElementById("loading-overlay").style.display = "block";

  load_listeners.push({
    callback: callback,
    called: false,
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
        item[key.name] =
          item[key.name] == null ? key.if_null : item[key.name][key.property];
      } else if (key.attribute) {
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
  } else {
    var next_state = history.shift();
    if (next_state.type == "selector") {
      click(next_state.selector, function () {
        restore_state(history, msg, cb);
      });
    } else if (next_state.type == "url") {
      go_to_url(next_state.url, function () {
        restore_state(history, msg, cb);
      });
    } else if (next_state.type == "func") {
      history_funcs[next_state.id](function () {
        restore_state(history, msg, cb);
      });
    } else {
      console.log("bad state " + next_state);
    }
  }
}

function scroll_to_index(cluster, desired_start_index, cb) {
  var cards = document.querySelectorAll(".lane-content > .material-card");
  var scroll_step =
    desired_start_index > 0
      ? cards[parseInt(cluster.getAttribute("data-col-count"))].offsetTop -
        cards[0].offsetTop
      : 0;
  var scroll_event = document.createEvent("HTMLEvents");
  scroll_event.initEvent("scroll", false, true);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === "data-start-index") {
        var current_idx = cluster.getAttribute("data-start-index");
        if (
          cluster.getAttribute("data-end-index") !=
            cluster.getAttribute("data-row-count") &&
          desired_start_index != current_idx
        ) {
          document.querySelector("#mainContainer").scrollTop += scroll_step;
          document.querySelector("#mainContainer").dispatchEvent(scroll_event);
        } else {
          cb(observer);
        }
      }
    });
  });

  observer.observe(cluster, { attributes: true });

  cluster.setAttribute(
    "data-start-index",
    cluster.getAttribute("data-end-index") + 1
  );
  document.querySelector("#mainContainer").scrollTop = 0;
  document.querySelector("#mainContainer").dispatchEvent(scroll_event);

  return observer;
}

function get_artists(msg) {
  var history = [
    {
      type: "url",
      url: "#/artists",
    },
  ];

  restore_state(history, msg, function (msg) {
    var cluster = document.querySelector(".material-card-grid");
    var desired_start_index = Math.floor(
      msg.offset / parseInt(cluster.getAttribute("data-col-count"))
    );

    var cards = document.querySelectorAll(".lane-content > .material-card");
    var scroll_step =
      desired_start_index > 0
        ? cards[parseInt(cluster.getAttribute("data-col-count"))].offsetTop
        : 0;

    var parse_data = function (observer) {
      var raw_artists = document.querySelectorAll(
        ".lane-content > .material-card"
      );
      var offset =
        cluster.getAttribute("data-col-count") *
        cluster.getAttribute("data-start-index");
      var artists = parse_raw_data(raw_artists, offset, artist_map);

      if (popup_port) {
        popup_port.postMessage({
          type: "artists",
          data: artists,
          offset: offset,
          history: history,
          count: parseInt(document.querySelector("#countSummary").innerText),
        });
      }

      if (observer != null) observer.disconnect();
    };

    scroll_to_index(cluster, desired_start_index, parse_data);
  });
}

function get_albums(msg) {
  var history = [
    {
      type: "url",
      url: "#/albums",
    },
  ];

  restore_state(history, msg, function (msg) {
    var cluster = document.querySelector(".material-card-grid");
    var desired_start_index = Math.floor(
      msg.offset / parseInt(cluster.getAttribute("data-col-count"))
    );

    var cards = document.querySelectorAll(".lane-content > .material-card");
    var scroll_step =
      desired_start_index > 0
        ? cards[parseInt(cluster.getAttribute("data-col-count"))].offsetTop -
          cards[0].offsetTop +
          4
        : 0;

    var parse_data = function (observer) {
      var raw_albums = document.querySelectorAll(
        ".lane-content > .material-card"
      );
      var start_offset =
        cluster.getAttribute("data-col-count") *
        cluster.getAttribute("data-start-index");
      var albums = parse_raw_data(raw_albums, start_offset, album_map);

      if (popup_port) {
        popup_port.postMessage({
          type: "albums",
          data: albums,
          offset: start_offset,
          count: parseInt(document.querySelector("#countSummary").innerText),
          history: history,
        });
      }
      if (observer != null) observer.disconnect();
    };

    scroll_to_index(cluster, desired_start_index, parse_data);
  });
}

function get_stations(msg) {
  var history = [
    {
      type: "url",
      url: "#/wms",
    },
  ];

  restore_state(history, msg, function (msg) {
    var raw_recent_stations = document.querySelectorAll(
      ".g-content .my-recent-stations-cluster-wrapper .lane-content .material-card"
    );
    var raw_my_stations = document.querySelectorAll(
      ".g-content .section-header+.cluster .lane-content .material-card"
    );

    var recent_stations = parse_raw_data(raw_recent_stations, 0, station_map);
    var my_stations = parse_raw_data(raw_my_stations, 0, station_map);

    var stations = {
      recent_stations: recent_stations,
      my_stations: my_stations,
    };

    if (popup_port) {
      popup_port.postMessage({
        type: "stations",
        data: stations,
        history: history,
      });
    }
  });
}

function get_album_art(art) {
  return !art || art == "https://undefined"
    ? "img/default_album.png"
    : art.substring(0, art.search("=") + 1) + "s320";
}

function get_time(time) {
  return time
    .split(":")
    .map(function (num, index, arr) {
      return parseInt(num, 10) * Math.pow(60, arr.length - index - 1);
    })
    .reduce(function (a, b) {
      return a + b;
    });
}

function get_recent(msg) {
  var history = [
    {
      type: "url",
      url: "#/recents",
    },
  ];

  restore_state(history, msg, function (msg) {
    var raw_recent = document.querySelectorAll(".gpm-card-grid sj-card");

    var recent = parse_raw_data(raw_recent, 0, recent_map);

    if (popup_port) {
      popup_port.postMessage({
        type: "recent",
        data: recent,
        history: history,
      });
    }
  });
}

function search(msg) {
  var history = [
    {
      type: "url",
      url: "#/sr/" + encodeURIComponent(msg.query),
    },
  ];
  restore_state(history, msg, function (msg) {
    var artists = [],
      albums = [],
      songs = [];

    var raw_artists = document.querySelectorAll(
      '.cluster[data-type="srar"] .material-card'
    );
    var raw_albums = document.querySelectorAll(
      '.cluster[data-type="sral"] .material-card'
    );
    var raw_songs = document.querySelectorAll(
      '.cluster[data-type="srs"] .song-row'
    );

    var artists = parse_raw_data(raw_artists, 0, artist_map);
    var albums = parse_raw_data(raw_albums, 0, album_map);
    var songs = parse_raw_data(raw_songs, 0, song_map);

    var search = {
      artists: artists,
      albums: albums,
      songs: songs,
    };

    if (popup_port) {
      popup_port.postMessage({
        type: "search",
        data: search,
        history: history,
      });
    }
  });
}

// TODO: use all four images in the playlist instead of just one
function get_playlists(msg) {
  var history = [
    {
      type: "url",
      url: "#/wmp",
    },
  ];

  restore_state(history, msg, function (msg) {
    var recent_playlists = [],
      auto_playlists = [],
      my_playlists = [];

    var raw_playlists = document.querySelectorAll(".g-content .cluster");

    var raw_recent_playlists = raw_playlists[0].querySelectorAll(
      ".lane-content .material-card"
    );
    var raw_auto_playlists = raw_playlists[1].querySelectorAll(
      ".lane-content .material-card"
    );

    recent_playlists = parse_raw_data(raw_recent_playlists, 0, playlist_map);
    auto_playlists = parse_raw_data(raw_auto_playlists, 0, playlist_map);

    var cluster = document.querySelector(".material-card-grid");
    var desired_start_index = Math.floor(
      msg.offset / parseInt(cluster.getAttribute("data-col-count"))
    );

    var cards = cluster.querySelectorAll(".lane-content > .material-card");
    var scroll_step =
      desired_start_index > 0
        ? cards[parseInt(cluster.getAttribute("data-col-count"))].offsetTop -
          cards[0].offsetTop +
          4
        : 0;

    var parse_data = function (observer) {
      var raw_my_playlists = raw_playlists[2].querySelectorAll(
        ".lane-content .material-card"
      );
      var start_offset =
        cluster.getAttribute("data-col-count") *
        cluster.getAttribute("data-start-index");
      my_playlists = parse_raw_data(
        raw_my_playlists,
        start_offset,
        playlist_map
      );

      var playlists = {
        recent_playlists: recent_playlists,
        auto_playlists: auto_playlists,
        my_playlists: my_playlists,
      };

      if (popup_port) {
        popup_port.postMessage({
          type: "playlists",
          data: playlists,
          offset: start_offset,
          count: parseInt(document.querySelector("#countSummary").innerText),
          history: history,
        });
      }
      if (observer != null) observer.disconnect();
    };

    // TODO: does the scroll work properly for playlists
    //       (playlists start scrolling later)
    scroll_to_index(cluster, desired_start_index, parse_data);
  });
}

function data_click(msg) {
  restore_state(msg.history, msg, function (msg) {
    if (msg.click_type == "album") {
      var url = "#/album/" + msg.id;

      var parse_album = function () {
        var raw_songs = document.querySelectorAll(
          "#music-content .song-table .song-row"
        );
        var songs = parse_raw_data(raw_songs, 0, song_map);
        if (popup_port) {
          popup_port.postMessage({
            type: "playlist",
            data: songs,
            history: [
              {
                type: "url",
                url: url,
              },
            ],
            title: document.querySelector("#mainContainer .title").firstChild
              .nodeValue,
            subtitle: document.querySelector("#mainContainer .creator-name")
              .innerText,
          });
        }
      };
      go_to_url(url, parse_album);
    } else if (msg.click_type == "artist") {
      var url = "#/artist/" + msg.id;
      var parse_artist = function () {
        var raw_songs = document.querySelectorAll(
          "#music-content .song-table .song-row"
        );
        var raw_albums = document.querySelectorAll(
          '.cluster[data-type="saral"] .material-card'
        );

        var songs = parse_raw_data(raw_songs, 0, song_map);
        var albums = parse_raw_data(raw_albums, 0, album_map);
        var artist = {
          songs: songs,
          albums: albums,
        };

        if (popup_port) {
          popup_port.postMessage({
            type: "artist",
            data: artist,
            history: [
              {
                type: "url",
                url: url,
              },
            ],
            title: document.querySelector("#mainContainer .name").innerText,
          });
        }
      };

      go_to_url(url, parse_artist);
    } else if (msg.click_type == "playlist") {
      document
        .querySelector(
          '.song-table > tbody > .song-row[data-id="' + msg.id + '"] button'
        )
        .click();

      window.setTimeout(function () {
        update();
      }, 30);
    } else if (msg.click_type == "playlists") {
      var idx = 0;
      switch (msg.playlist_type) {
        case "recent_playlist":
          idx = 0;
          break;
        case "auto_playlist":
          idx = 1;
          break;
        case "my_playlist":
          idx = 2;
          break;
      }
      var raw_playlists = document
        .querySelectorAll(".g-content .cluster")
        [idx].querySelectorAll(".lane-content .material-card");

      if (msg.playlist_type != "my_playlist") {
        raw_playlists[msg.index]
          .querySelector(".play-button-container")
          .click();
      } else {
        go_to_url("#/pl/" + msg.id, function () {
          document.querySelector('paper-fab[data-id="play"]').click();
          window.setTimeout(function () {
            update();
          }, 30);
        });
      }
    }

    // TODO do this without going to the album page...
    else if (msg.click_type == "recent") {
      var card = document.querySelectorAll("gpm-card-grid sj-card")[msg.index];
      var url =
        card.getAttribute("data-type") + "/" + card.getAttribute("data-id");
      go_to_url("#/" + url, function () {
        document.querySelector('paper-fab[data-id="play"]').click();
        window.setTimeout(function () {
          update();
        }, 30);
      });
    } else if (msg.click_type == "station") {
      var stations;
      if (msg.station_type == "my_station") {
        stations = document.querySelectorAll(
          ".g-content .section-header+.cluster .lane-content .material-card"
        );
      } else if (msg.station_type == "recent_station") {
        stations = document.querySelectorAll(
          ".g-content .my-recent-stations-cluster-wrapper .lane-content .material-card"
        );
      }
      stations[msg.index].querySelector(".play-button-container").click();

      window.setTimeout(function () {
        update();
      }, 30);
    }
  });
}

function init() {
  route("get_artists", get_artists);
  route("get_albums", get_albums);
  route("get_playlists", get_playlists);
  route("get_stations", get_stations);
  route("get_recent", get_recent);
  route("search", search);
  route("data_click", data_click);
  route("send_command", send_command);

  var trigger = document.getElementById("loading-overlay");
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.attributeName === "style" &&
        window.getComputedStyle(trigger).getPropertyValue("display") === "none"
      ) {
        load_listeners.forEach(function (listener) {
          if (listener.called === false) {
            listener.called = true;
            listener.callback();
          }
        });

        load_listeners = load_listeners.filter(function (listener) {
          return listener.called === false;
        });
      }
    });
  });

  observer.observe(trigger, { attributes: true });
}

document.addEventListener("DOMContentLoaded", init);
if (document.readyState != "loading") {
  init();
}
