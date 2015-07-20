var controller = popupApp.controller('PopupController', ['$scope', function($scope) {
    $scope.StateEnum = StateEnum;
    $scope.RepeatEnum = RepeatEnum;
    $scope.ThumbEnum = ThumbEnum;
    $scope.StatusEnum = StatusEnum;

    $scope.background_port = null;
    $scope.interface_port = null;
    $scope.dragging = false;

    $scope.music_status = {};

    $scope.music_status.state = StateEnum.NO_TAB;
    $scope.music_status.title = 'No music tab found';
    $scope.music_status.artist = '';
    $scope.music_status.album = '';
    $scope.music_status.album_art = 'img/default_album.png';
    $scope.music_status.shuffle = false;
    $scope.music_status.repeat = 0;
    $scope.music_status.current_time = '';
    $scope.music_status.total_time = '';
    $scope.music_status.current_time_s = 0;
    $scope.music_status.total_time_s = 0;
    $scope.music_status.status = StatusEnum.PAUSED;
    $scope.music_status.disabled = {};
    $scope.music_status.volume = 0;
    $scope.music_status.thumb = 0;
    $scope.music_status.vol_pressed = false;
    $scope.music_status.playlist_pressed = false;
    $scope.music_status.slider_dragging = false;

    $scope.playlist = [];

    $scope.repeat_icon = function() {
      return ($scope.music_status.repeat == RepeatEnum.ONE) ? 'repeat_one' : 'repeat';
    };

    $scope.volume_icon = function() {
      if ($scope.music_status.volume == 0 || $scope.music_status.vol_pressed) {
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

    $scope.album_art_background = function() {
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url(' + $scope.music_status.album_art + ')';
    };

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
        $scope.interface_port.postMessage(
        {
          'action': 'send_command',
          'type': 'playlist',
          'index': index
        });
      }
    }

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
          $scope.interface_port.onMessage.addListener(update);
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
              $.extend($scope.music_status, response);

              $scope.set_disabled(response.disabled_buttons);

              for (var i = 0; i < response.playlist.length; i++) {
                if (response.playlist[i].title &&
                    ($scope.playlist.length <= i ||
                     response.playlist[i].title != $scope.playlist[i].title ||
                     response.playlist[i].currently_playing != $scope.playlist[i].currently_playing)) {
                  $scope.playlist[i] = response.playlist[i];
                  $scope.playlist[i].index = i;
                }
              }
            });
          }
        }
      }

      setupAnalytics();
    }

    init();
  }]);