var controller = popupApp.controller('PopupController', ['$scope', function($scope) {
    $scope.StateEnum = StateEnum;
    $scope.RepeatEnum = RepeatEnum;
    $scope.ThumbEnum = ThumbEnum;
    $scope.StatusEnum = StatusEnum;

    $scope.background_port = null;
    $scope.interface_port = null;

    $scope.status = {
      vol_pressed: false,
      playlist_pressed: false,
      slider_dragging: false,
      displayed_content: '',
      scrolling_busy: false
    };

    $scope.music_status = {
      state: StateEnum.NO_TAB,
      title: 'No music tab found',
      artist: '',
      album: '',
      album_art: 'img/default_album.png',
      shuffle: false,
      repeat: RepeatEnum.NONE,
      current_time: '',
      total_time: '',
      current_time_s: 0,
      total_time_s: 0,
      status: StatusEnum.PAUSED,
      disabled: {},
      volume: 100,
      thumb: ThumbEnum.NONE,
    };

    $scope.data = {
      playlists: {
        recent_playlists: [],
        auto_playlists: [],
        my_playlists: []
      },
      recent: [],
      stations: {
        recent_stations: [],
        my_stations: []
      },
      artists: [],
      albums: [],
      playlist: [],
      current_playlist: [],
      loading: [],
      '': [],
      last_history: [],
    }

    $scope.counts = {};

    $scope.repeat_icon = function() {
      return ($scope.music_status.repeat == RepeatEnum.ONE) ? 'repeat_one' : 'repeat';
    };

    $scope.volume_icon = function() {
      if ($scope.music_status.volume == 0) {
        return 'volume_mute';
      }
      else if ($scope.music_status.volume < 50) {
        return 'volume_down';
      }
      else {
        return 'volume_up';
      }
    }

    $scope.status_icon = function() {
      return ($scope.music_status.status == StatusEnum.PAUSED) ? 'play_arrow' : 'pause';
    }

    $scope.should_show_art = function() {
      return ($scope.status.playlist_pressed == false && $scope.status.displayed_content.length == 0);
    }

    $scope.album_art_background = function() {
      return ($scope.music_status.state == StateEnum.PLAYING ? '' : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0)), no-repeat ') + 'url(' + $scope.music_status.album_art + ')';
    };

    $scope.artist_background = function(image) {
      return 'url(' + image + ') center / cover';
    }

    $scope.status_title = function() {
      return ($scope.music_status.status == StatusEnum.PAUSED) ? 'Play' : 'Pause';
    }

    $scope.set_state = function(state) {
      $scope.music_status.state = state;
      switch (state) {
        case StateEnum.NO_TAB:
          $scope.music_status.album_art = 'img/default_album.png';
          $scope.music_status.title = 'No music tab found';
          $scope.music_status.artist = '';
          $scope.music_status.album = '';
          break;
        case StateEnum.NO_SONG:
          $scope.music_status.album_art = 'img/default_album.png';
          $scope.music_status.title = 'No song selected';
          $scope.music_status.artist = '';
          $scope.music_status.album = '';
          break;
        case StateEnum.PLAYING:
          // do nothing
          break;
      }
    };

    $scope.set_disabled = function(disabled) {
      $scope.music_status.disabled = {};
      for (var i = 0; i < disabled.length; i++) {
        $scope.music_status.disabled[disabled[i]] = true;
      }
    }

    $scope.playlist_click = function(index) {
      if ($scope.interface_port) {
        // $scope.interface_port.postMessage(
        // {
        //   'action': 'send_command',
        //   'type': 'playlist',
        //   'index': index,
        //   'history': $scope.data.last_history
        // });
        $scope.interface_port.postMessage(
        {
          action: 'data_click',
          click_type: 'playlist',
          index: index,
          history: $scope.data.last_history
        });
      }
    }

    $scope.playlist_button_pressed = function() {
      $scope.status.playlist_pressed=!$scope.status.playlist_pressed;
      if ($scope.status.playlist_pressed) {
        $scope.status.displayed_content = 'current_playlist';
      }
      else {
        $scope.status.displayed_content = '';
      }
    }

    $scope.settings_click = function($event) {
      chrome.tabs.create({url: chrome.extension.getURL('options.html')});
      $event.stopPropagation();
    }

    $scope.data_click = function(type, data) {
      if ($scope.interface_port) {
        switch (type) {
          case 'album':
            $scope.interface_port.postMessage(
            {
              action: 'data_click',
              click_type: 'album',
              offset: data.offset,
              id: data.id,
              history: $scope.data.last_history,
            });
            $scope.status.displayed_content = 'loading';
            break;
          case 'recent_station':
          case 'my_station':
            $scope.interface_port.postMessage(
            {
              action: 'data_click',
              click_type: 'station',
              station_type: type,
              index: data.index,
              history: $scope.data.last_history,
            });
            $scope.status.displayed_content = '';
            break;
          case 'recent_playlist':
          case 'auto_playlist':
          case 'my_playlist':
            $scope.interface_port.postMessage(
            {
              action: 'data_click',
              click_type: 'playlists',
              playlist_type: type,
              index: data.index,
              history: $scope.data.last_history,
            });
            $scope.status.displayed_content = '';
            break;
          case 'recent':
            $scope.interface_port.postMessage(
            {
              action: 'data_click',
              click_type: 'recent',
              index: data.index,
              history: $scope.data.last_history,
            });
            $scope.status.displayed_content = '';
            break;
        }
      }
    }

    $scope.drawer_click = function(clicked) {
      if ($scope.interface_port) {
        $scope.interface_port.postMessage(
        {
          action: clicked,
          offset: 0
        });
      }

      if (clicked != 'library') {
        $scope.status.displayed_content = 'loading';
      }
      else {
        $scope.status.displayed_content = '';
      }
      $('.mdl-layout__obfuscator').click();
    }

    $scope.album_art_click = function() {
      if ($scope.interface_port) {
        chrome.tabs.update($scope.interface_port.id, {highlighted: true});
        chrome.tabs.get($scope.interface_port.id, function (tab) {
          chrome.windows.update(tab.windowId, {focused: true});
        });
      }
    }

    $scope.scroll_data = function(content_type) {
      if ($scope.interface_port) {
        $scope.interface_port.postMessage(
        {
          action: 'get_' + content_type,
          offset: (content_type == 'stations' ? 0 : $scope.data[content_type].length)
        });
      }
      $scope.status.scrolling_busy = true;
    }

    $scope.should_disable_scroll = function() {
      if ($scope.status.scrolling_busy) return true;


      if ($scope.status.displayed_content == 'stations') {
        // TODO
      }
      else {
        return $scope.counts[$scope.status.displayed_content] == $scope.data[$scope.status.displayed_content].length;
      }
    }

    $scope.is_song_playing = function(song) {
      return (song.title == $scope.music_status.title &&
              song.artist == $scope.music_status.artist &&
              song.album == $scope.music_status.album);
    }

    $scope.handle_key = function($event) {
      if ($event.keyCode == 32 || $event.charCode === 32) {
        $scope.$apply(function() {
          $scope.music_status.status = !$scope.music_status.status;
        });
        if ($scope.interface_port) {
          $scope.interface_port.postMessage(
          {
            action: 'send_command',
            type: 'play'
          });
        }
      }
    }

    $scope.$on('$includeContentLoaded', function () {
      componentHandler.upgradeDom();
    });

    var init = function () {
      $scope.background_port = chrome.runtime.connect({name: "popup"});

      $scope.background_port.onMessage.addListener(function(msg) {
        if (msg.type == 'connect') {
          $scope.interface_port = chrome.tabs.connect(msg.id, {name: "popup"});
          $scope.interface_port.id = msg.id;
          $scope.interface_port.onDisconnect.addListener(function() {
            $scope.interface_port = null;
            $scope.$apply(function() {
              $scope.set_state(StateEnum.NO_TAB);
            });
          });
          $scope.interface_port.onMessage.addListener(route_interface_msg);
          $scope.$apply(function() {
            $scope.set_state(StateEnum.NO_SONG);
          });
        }
      });

      function setupAnalytics() {
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-48472705-1']);
        _gaq.push(['_trackPageview']);

        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      }

      function route_interface_msg(msg) {
        if (msg.type === 'status') {
          update(msg.data);
        }
        else {
          if (msg.type === 'artists' || msg.type === 'albums') {
            $scope.data[msg.type] = $scope.data[msg.type].slice(0, msg.offset).concat(msg.data);
            $scope.status.scrolling_busy = false;
            $scope.counts[msg.type] = msg.count;
            $scope.data.last_history = msg.history;
          }
          else if (msg.type === 'playlists') {
            $scope.data.playlists.my_playlists = $scope.data.playlists.my_playlists.slice(0, msg.offset).concat(msg.data.my_playlists);
            $scope.data.playlists.auto_playlists = msg.data.auto_playlists;
            $scope.data.playlists.recent_playlists = msg.data.recent_playlists;
            $scope.status.scrolling_busy = false;
            $scope.counts.playlists = msg.count;
            $scope.data.last_history = msg.history;
          }
          else {
            $scope.data[msg.type] = msg.data;
            $scope.data.last_history = msg.history;
          }
          // else if (msg.type === 'albums') {
          //   $scope.albums = msg.data;
          // }
          // else if (msg.type === 'stations') {
          //   $scope.stations = msg.data;
          // }
          // else if (msg.type === 'recent') {
          //   $scope.recents = msg.data;
          // }
          $scope.status.displayed_content = msg.type;
        }
      }

      function update(response) {
        if (chrome.extension.lastError) {
          $scope.$apply(function() {
            $scope.set_state(StateEnum.NO_TAB);
          });
        }
        else {
          if (response.title === '') {
            $scope.$apply(function() {
              $scope.set_state(StateEnum.NO_SONG);
            });
          }
          else {
            $scope.$apply(function() {
              $scope.set_state(StateEnum.PLAYING);
              if ($scope.status.slider_dragging === true) {
                response.current_time_s = $scope.current_time_s;
                response.current_time = $scope.current_time;
              }
              $.extend($scope.music_status, response);

              $scope.set_disabled(response.disabled_buttons);

              for (var i = 0; response.playlist && i < response.playlist.length; i++) {
                if (response.playlist[i].title &&
                    ($scope.data.current_playlist.length <= i ||
                     response.playlist[i].title != $scope.data.current_playlist[i].title ||
                     response.playlist[i].currently_playing != $scope.data.current_playlist[i].currently_playing)) {
                  $scope.data.current_playlist[i] = response.playlist[i];
                  $scope.data.current_playlist[i].index = i;
                }
              }
            });
          }
        }
      }

      // setupAnalytics();
    }

    init();
  }]);
