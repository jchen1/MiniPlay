var popupApp = angular.module('app', []);

var controller = popupApp.controller('PopupController', ['$scope', function($scope) {
    $scope.state = 0;

    $scope.title = 'No music tab found';
    $scope.artist = '';
    $scope.album = '';
    $scope.album_art = 'img/default_album.png';

    $scope.shuffle = false;
    $scope.repeat = 0;

    $scope.current_time = '';
    $scope.total_time = '';
    $scope.current_time_s = 0;
    $scope.total_time_s = 0;

    $scope.status = 'play_arrow';
    $scope.disabled = {};

    $scope.volume = 0;
    $scope.thumb = 0;

    $scope.vol_pressed = false;
    $scope.playlist_pressed = false;
    $scope.slider_dragging = false;

    $scope.playlist = [];

    $scope.repeat_icon = function() {
      return ($scope.repeat == 2) ? 'repeat_one' : 'repeat';
    };

    $scope.volume_icon = function() {
      if ($scope.volume == 0 || $scope.vol_pressed) {
        return 'volume_mute';
      }
      else if ($scope.volume < 50) {
        return 'volume_down';
      }
      else {
        return 'volume_up';
      }
    }

    $scope.album_art_background = function() {
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url(' + $scope.album_art + ')';
    };

    $scope.status_title = function() {
        return $scope.status == 'play_arrow' ? 'Play' : 'Pause';
    }

    $scope.set_state = function(state) {
      $scope.state = state;
      switch (state) {
        case 0:
          $scope.album_art = 'img/default_album.png';
          $scope.title = 'No music tab found';
          $scope.artist = '';
          $scope.album = '';
          break;
        case 1:
          $scope.album_art = 'img/default_album.png';
          $scope.title = 'No song selected';
          $scope.artist = '';
          $scope.album = '';
          break;
        case 2:
          // do nothing
          break;
      }
    };

    $scope.set_disabled = function(disabled) {
      $scope.disabled = {};
      for (var i = 0; i < disabled.length; i++) {
        switch (disabled[i]) {
          case 'play': $scope.disabled['play'] = true; break;
          case 'rew': $scope.disabled['rew'] = true; break;
          case 'ff': $scope.disabled['ff'] = true; break;
          case 'up': $scope.disabled['up'] = true; break;
          case 'down': $scope.disabled['down'] = true; break;
          case 'shuffle': $scope.disabled['shuffle'] = true; break;
          case 'repeat': $scope.disabled['repeat'] = true; break;
          case 'slider': $scope.disabled['slider'] = true; break;
          case 'vslider': $scope.disabled['vslider'] = true; break;
          case 'playlist': $scope.disabled['playlist'] = true; break;
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

var background_port = null;
var interface_port = null;

$(function() {
  background_port = chrome.runtime.connect({name: "popup"});
  var popupScope = angular.element(document.getElementById('popup')).scope();

  background_port.onMessage.addListener(function(msg) {
    if (msg.type == 'connect') {
      interface_port = chrome.tabs.connect(msg.id, {name: "popup"});
      interface_port.id = msg.id;
      interface_port.onDisconnect.addListener(function() {
        interface_port = null;
        popupScope.$apply(function() {
          popupScope.set_state(0);
        });
      });
      interface_port.onMessage.addListener(update);
    }
    popupScope.$apply(function() {
      popupScope.set_state(1);
    });
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
        popupScope.set_state(0);
      });
    }
    else {
      if (response.title === '') {
        popupScope.$apply(function() {
          popupScope.set_state(1);
        });
      }
      else {
        popupScope.$apply(function() {
          popupScope.set_state(2);
          popupScope.title = response.title;
          popupScope.artist = response.artist;
          popupScope.album = response.album;
          popupScope.album_art = response.album_art;
          popupScope.status = response.status == 'Pause' ? 'pause' : 'play_arrow';
          console.log(response.shuffle);
          popupScope.shuffle = response.shuffle == 'NO_SHUFFLE' ? false : true;
          popupScope.repeat = response.repeat == "NO_REPEAT" ? 0 : (response.repeat == "SINGLE_REPEAT" ? 1 : 2);
          popupScope.thumb = response.thumb;

          popupScope.volume = response.volume * 100;

          popupScope.current_time = response.current_time;
          popupScope.total_time = response.total_time;
          // popupScope.current_time_s = response.current_time_s;
          popupScope.total_time_s = response.total_time_s;

          popupScope.set_disabled(response.disabled_buttons);

          for (var i = 0; i < response.playlist.length; i++) {
            if (popupScope.playlist.length <= i || response.playlist[i].title != popupScope.playlist[i].title) {
              popupScope.playlist[i] = response.playlist[i];
              popupScope.playlist[i].index = i;
            }
          }
        });

        // do stuff angular can't do... like update sliders
        if (!popupScope.slider_dragging) {
          var offset = response.current_time_s / response.total_time_s;
          $('#slider-wrapper').find('.mdl-slider__background-lower').attr('style', 'flex: ' + offset + ' 1 0%;');
          $('#slider-wrapper').find('.mdl-slider__background-upper').attr('style', 'flex: ' + (1 - offset) + ' 1 0%;');
          $('#slider').val(response.current_time_s);
          if (response.current_time_s > 0) {
            $('#slider').removeClass('is-lowest-value');
          }
          else {
            $('#slider').addClass('is-lowest-value');
          }
        }

        $('#vol-slider').val(response.volume * 100);
        $('#vol-wrapper').find('.mdl-slider__background-lower').attr('style', 'flex: ' + response.volume + ' 1 0%;');
        $('#vol-wrapper').find('.mdl-slider__background-upper').attr('style', 'flex: ' + (1 - response.volume) + ' 1 0%;');
        if ($('#vol-slider').val() > 0) {
          $('#vol-slider').removeClass('is-lowest-value');
        }
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
