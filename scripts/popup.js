var popupApp = angular.module('app', []);
var popupScope = null;

const StateEnum = {
  NO_TAB : 0,
  NO_SONG : 1,
  PLAYING : 2
}

const RepeatEnum = {
  NONE: 0,
  ONE: 1,
  ALL: 2
}

const ThumbEnum = {
  NONE: 0,
  UP: 5,
  DOWN: 1
}

var controller = popupApp.controller('PopupController', ['$scope', function($scope) {
    $scope.StateEnum = StateEnum;
    $scope.RepeatEnum = RepeatEnum;
    $scope.ThumbEnum = ThumbEnum;

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
    $scope.music_status.status = 'play_arrow';
    $scope.music_status.disabled = {};
    $scope.music_status.volume = 0;
    $scope.music_status.thumb = 0;
    $scope.music_status.vol_pressed = false;
    $scope.music_status.playlist_pressed = false;
    $scope.music_status.slider_dragging = false;
    $scope.music_status.playlist = [];

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

    $scope.album_art_background = function() {
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url(' + $scope.music_status.album_art + ')';
    };

    $scope.status_title = function() {
        return $scope.music_status.status == 'play_arrow' ? 'Play' : 'Pause';
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
        switch (disabled[i]) {
          case 'play': $scope.music_status.disabled['play'] = true; break;
          case 'rew': $scope.music_status.disabled['rew'] = true; break;
          case 'ff': $scope.music_status.disabled['ff'] = true; break;
          case 'up': $scope.music_status.disabled['up'] = true; break;
          case 'down': $scope.music_status.disabled['down'] = true; break;
          case 'shuffle': $scope.music_status.disabled['shuffle'] = true; break;
          case 'repeat': $scope.music_status.disabled['repeat'] = true; break;
          case 'slider': $scope.music_status.disabled['slider'] = true; break;
          case 'vslider': $scope.music_status.disabled['vslider'] = true; break;
          case 'playlist': $scope.music_status.disabled['playlist'] = true; break;
        }
      }
    }

    $scope.playlist_click = function(index) {
      if (interface_port) {
        interface_port.postMessage(
        {
          'action': 'send_command',
          'type': 'playlist',
          'index': index
        });
      }
    }
  }]);

popupApp.directive('mpSlider', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(function() {
        return attrs.value;
      }, function() {
        for (var i = 0; i < element.length; i++) {
          if (element[i].MaterialSlider) {
            element[i].MaterialSlider.change();
          }
        }
        $(element).hide().show(0);
      });
    }
  }
});

var background_port = null;
var interface_port = null;

$(function() {
  background_port = chrome.runtime.connect({name: "popup"});
  popupScope = angular.element(document.getElementById('popup')).scope();

  background_port.onMessage.addListener(function(msg) {
    if (msg.type == 'connect') {
      interface_port = chrome.tabs.connect(msg.id, {name: "popup"});
      interface_port.id = msg.id;
      interface_port.onDisconnect.addListener(function() {
        interface_port = null;
        popupScope.$apply(function() {
          popupScope.set_state(StateEnum.NO_TAB);
        });
      });
      interface_port.onMessage.addListener(update);
      popupScope.$apply(function() {
        popupScope.set_state(StateEnum.NO_SONG);
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

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
  }

  function update(response) {
    if (chrome.extension.lastError) {
      popupScope.$apply(function() {
        popupScope.set_state(StateEnum.NO_TAB);
      });
    }
    else {
      if (response.title === '') {
        popupScope.$apply(function() {
          popupScope.set_state(StateEnum.NO_SONG);
        });
      }
      else {
        popupScope.$apply(function() {
          popupScope.set_state(StateEnum.PLAYING);
          popupScope.music_status.title = response.title;
          popupScope.music_status.artist = response.artist;
          popupScope.music_status.album = response.album;
          popupScope.music_status.album_art = response.album_art;
          popupScope.music_status.status = response.status == 'Pause' ? 'pause' : 'play_arrow';
          popupScope.music_status.shuffle = response.shuffle == 'NO_SHUFFLE' ? false : true;
          console.log(response.repeat);
          popupScope.music_status.repeat = response.repeat;
          popupScope.music_status.thumb = response.thumb;
          popupScope.music_status.volume = response.volume;
          popupScope.music_status.current_time = response.current_time;
          popupScope.music_status.total_time = response.total_time;
          popupScope.music_status.current_time_s = response.current_time_s;
          popupScope.music_status.total_time_s = response.total_time_s;

          popupScope.set_disabled(response.disabled_buttons);

          for (var i = 0; i < response.playlist.length; i++) {
            if (popupScope.music_status.playlist.length <= i || response.playlist[i].title != popupScope.music_status.playlist[i].title) {
              popupScope.music_status.playlist[i] = response.playlist[i];
              popupScope.music_status.playlist[i].index = i;
            }
          }
        });
      }
    }
  }

  $('.control, .top-control').on('click', function(e) {
    if (interface_port) {
      interface_port.postMessage(
      {
        'action': 'send_command',
        'type': $(e.currentTarget).attr('id')
      });
    }
    e.stopPropagation();
  });

  $('#vol-slider').on('input', function() {
    if (interface_port) {
      interface_port.postMessage(
      {
        'action': 'send_command',
        'type': 'vslider',
        'position': $('#vol-slider').val() / $('#vol-slider').attr('max')
      });
    }
  });

  // TODO: slider is broken when tab is not in focus
  $('#slider').on('mouseup', function() {
    dragging = false;

    if (interface_port) {
      interface_port.postMessage(
      {
        'action': 'send_command',
        'type': 'slider',
        'position': $('#slider').val() / $('#slider').attr('max')
      });
    }
  }).on('mousedown', function() {
    dragging = true;
  }).on('input', function() {
    $('#current-time').html(secondsToHms($('#slider').val()));
  });

  $('#settings').click(function() {
    chrome.tabs.create({url: chrome.extension.getURL('options.html')});
  });

  $('#album-art').on('click', function() {
    if (interface_port) {
      chrome.tabs.update(interface_port.id, {highlighted: true});
      chrome.tabs.get(interface_port.id, function (tab) {
        chrome.windows.update(tab.windowId, {focused: true});
      });
    }
  });

  setupAnalytics();
});
