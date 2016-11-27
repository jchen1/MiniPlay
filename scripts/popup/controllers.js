const controller = popupApp.controller('PopupController', ['$scope', 'npService', function($scope, npService) {

  $scope.StateEnum = StateEnum;
  $scope.RepeatEnum = RepeatEnum;
  $scope.ThumbEnum = ThumbEnum;
  $scope.StatusEnum = StatusEnum;

  $scope.backgroundPort = null;
  $scope.interfacePort = null;

  $scope.colors = {
    gmusic: '#ef6c00',
    pandora: '#455774',
    spotify: '#84bd00',
    none: 'rgb(244, 67, 54)'
  };

  $scope.status = {
    vol_pressed: false,
    playlist_pressed: false,
    slider_dragging: false,
    displayed_content: '',
    scrolling_busy: false,
    drawer_open: false,
    current_color: $scope.colors.none
  };

  $scope.np = npService.get();

  $scope.data = {
    playlists: {
      recentPlaylists: [],
      autoPlaylists: [],
      myPlaylists: []
    },
    recent: [],
    stations: {
      recentStations: [],
      myStations: []
    },
    artists: [],
    albums: [],
    playlist: [],
    current_playlist: [],
    loading: [],
    '': [],
    last_history: [],
    query: '',
    search: {
      artists: [],
      albums: [],
      songs: []
    },
    artist: {
      albums: [],
      songs: []
    },
    title: '',
    subtitle: '',
    view_stack: []
  };

  $scope.settings = {};

  $scope.counts = {};

  $scope.repeat_icon = function() {
    return ($scope.np.status.repeat === RepeatEnum.ONE) ? 'repeat_one' : 'repeat';
  };

  $scope.menu_icon = function() {
    return ($scope.status.displayed_content === '' || $scope.status.displayed_content === 'current_playlist') ? 'menu' : 'arrow_back';
  };

  $scope.menu_icon_click = function() {
    if ($scope.np.status.protocol === 'gmusic') {
      if ($scope.status.displayed_content === '' || $scope.status.displayed_content === 'current_playlist') {
        $scope.status.drawer_open = true;
      } else {
        $scope.status.drawer_open = false;

        if ($scope.data.view_stack.length > 0) {
          const oldView = $scope.data.view_stack.pop();
          $scope.status.displayed_content = oldView.content;
          $scope.data.title = oldView.title;
          $scope.data.subtitle = oldView.subtitle;
        } else {
          $scope.status.displayed_content = '';
        }
      }
    } else {
        // todo: something??
    }
  };

  $scope.volume_icon = function() {
    if ($scope.np.status.volume === 0) {
      return 'volume_mute';
    } else if ($scope.np.status.volume < 50) {
      return 'volume_down';
    }

    return 'volume_up';
  };

  $scope.status_icon = function() {
    return ($scope.np.status.status === StatusEnum.PAUSED) ? 'play_arrow' : 'pause';
  };

  $scope.should_show_art = function() {
    return ($scope.status.playlist_pressed === false && $scope.status.displayed_content.length === 0);
  };

  $scope.album_art_background = function() {
    return `${$scope.np.state === StateEnum.PLAYING ? '' : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0)), no-repeat '}url(${$scope.np.status.album_art})`;
  };

  $scope.artist_background = function(image) {
    return `url(${image}) center / cover`;
  };

  $scope.status_title = function() {
    return ($scope.np.status.status === StatusEnum.PAUSED) ? 'Play' : 'Pause';
  };

  $scope.search = function() {
    if ($scope.interfacePort) {
      $scope.interfacePort.postMessage(
        {
          action: 'search',
          query: $scope.data.query
        });
      $scope.data.title = `Search: ${$scope.data.query}`;
      $scope.status.displayed_content = 'loading';
      $scope.status.playlist_pressed = false;
      $scope.status.drawer_open = false;
    }
  };

  $scope.setState = function(state) {
    switch (state) {
      case StateEnum.NO_TAB:
        $scope.np.status.album_art = 'img/default_album.png';
        $scope.np.status.title = 'No music tab found';
        $scope.np.status.artist = '';
        $scope.np.status.album = '';
        break;
      case StateEnum.NO_SONG:
        $scope.np.status.album_art = 'img/default_album.png';
        $scope.np.status.title = 'No song selected';
        $scope.np.status.artist = '';
        $scope.np.status.album = '';
        break;
      case StateEnum.PLAYING:
      default:
          // do nothing
        break;
    }
  };

  $scope.set_disabled = function(disabled) {
    $scope.np.disabled = {};
    for (let i = 0; i < disabled.length; i++) {
      $scope.np.disabled[disabled[i]] = true;
    }
  };

  $scope.playlist_click = function(id) {
    if ($scope.interfacePort) {
      $scope.interfacePort.postMessage(
        {
          action: 'dataClick',
          click_type: 'playlist',
          id,
          history: $scope.data.last_history
        });
    }
  };

  $scope.playlist_button_pressed = function() {
    $scope.status.playlist_pressed = !$scope.status.playlist_pressed;
    if ($scope.status.playlist_pressed) {
      $scope.status.displayed_content = 'current_playlist';
    } else {
      $scope.status.displayed_content = '';
    }
  };

  $scope.settings_click = function($event) {
    $scope.status.displayed_content = 'options';
    $scope.status.drawer_open = false;
    $scope.data.title = 'options';
  };

  $scope.dataClick = function(type, data) {
    const oldContent = $scope.status.displayed_content;
    if ($scope.interfacePort && $scope.np.status.protocol === 'gmusic') {
      $scope.status.displayed_content = 'loading';
      switch (type) {
        case 'recent':
          $scope.status.displayed_content = '';
        case 'album':
        case 'artist':
          $scope.interfacePort.postMessage(
            {
              action: 'dataClick',
              click_type: type,
              index: data.index,
              id: data.id,
              history: $scope.data.last_history,
            });
          if (type !== 'recent') {
            $scope.data.view_stack.push({
              content: oldContent,
              title: $scope.data.title,
              subtitle: $scope.data.subtitle
            });
          }
          break;
        case 'recent_station':
        case 'my_station':
          $scope.interfacePort.postMessage(
            {
              action: 'dataClick',
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
          $scope.interfacePort.postMessage(
            {
              action: 'dataClick',
              click_type: 'playlists',
              playlist_type: type,
              index: data.index,
              history: $scope.data.last_history,
            });
          $scope.status.displayed_content = '';
          break;
        default:
          break;
      }
    }
  };

  $scope.drawer_click = function(clicked) {
    if ($scope.interfacePort) {
      $scope.interfacePort.postMessage(
        {
          action: `get_${clicked}`,
          offset: 0
        });
    }

    if (clicked !== 'library') {
      $scope.status.displayed_content = 'loading';
      $scope.data.title = clicked;
      $scope.data.view_stack.length = 0;
    } else {
      $scope.status.displayed_content = '';
    }

    $scope.status.playlist_pressed = false;

    $scope.status.drawer_open = false;
  };

  $scope.album_art_click = function() {
    if ($scope.interfacePort) {
      chrome.tabs.update($scope.interfacePort.id, { highlighted: true });
      chrome.tabs.get($scope.interfacePort.id, tab => {
        chrome.windows.update(tab.windowId, { focused: true });
      });
    }
  };

  $scope.clear_stack = function() {
    $scope.data.view_stack.length = 0;
    $scope.status.displayed_content = '';
    $scope.data.title = '';
    $scope.data.subtitle = '';
  };

  $scope.scroll_data = function(contentType) {
    if ($scope.interfacePort) {
      $scope.interfacePort.postMessage(
        {
          action: `get_${contentType}`,
          offset: (contentType === 'stations' ? 0 : $scope.data[contentType].length)
        });
    }
    $scope.status.scrolling_busy = true;
  };

  $scope.lastfm_auth = function() {
    chrome.runtime.sendMessage({ type: 'auth' }, response => {});
  };

  $scope.launch_settings = function() {
    chrome.tabs.create({ url: 'chrome://extensions/configureCommands' });
  };

  $scope.should_disable_scroll = function() {
    if ($scope.status.scrolling_busy) return true;


    if ($scope.status.displayed_content === 'stations') {
      // TODO
      return true;
    }
    return $scope.counts[$scope.status.displayed_content] === $scope.data[$scope.status.displayed_content].length;
  };

  $scope.is_song_playing = function(song) {
    return (song.title === $scope.np.status.title &&
              song.artist === $scope.np.status.artist &&
              song.album === $scope.np.status.album);
  };

  $scope.is_drawer_open = function() {
    return $('.mdl-layout__drawer').hasClass('is-visible');
  };

  $scope.handle_key = function($event) {
    if (!$('.mdl-layout__drawer').hasClass('is-visible') && $event.keyCode === 32) {
      $scope.np.status.status = !$scope.np.status.status;
      if ($scope.interfacePort) {
        $scope.interfacePort.postMessage(
          {
            action: 'sendCommand',
            type: 'play'
          });
      }
    } else if (!$('.mdl-layout__drawer').hasClass('is-visible') && $event.keyCode === 8) {
      if ($scope.data.view_stack.length > 0) {
        const oldView = $scope.data.view_stack.pop();
        $scope.status.displayed_content = oldView.content;
        $scope.data.title = oldView.title;
        $scope.data.subtitle = oldView.subtitle;
      } else {
        $scope.status.displayed_content = '';
      }
    }
  };

  $scope.changeColor = function(newColor) {
    const oldColor = $scope.status.current_color;
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].href) {
        $.each(document.styleSheets[i].cssRules, (index, rule) => {
          if (rule && rule.style && rule.cssText.indexOf(oldColor) !== -1) {
            rule.style.cssText = rule.style.cssText.replace(oldColor, newColor);
          }
        });
      }
    }
    $scope.status.current_color = newColor;
  };

  $scope.$on('$includeContentLoaded', (event, src) => {
    componentHandler.upgradeDom();

    if (src === 'templates/options.html') {
      chrome.storage.sync.get(['shortcuts-enabled', 'notifications-enabled', 'scrobbling-enabled', 'lastfm_sessionID'], data => {
        $scope.$apply(() => {
          $.extend($scope.settings, data);
        });
      });
    }
  });

  function update(response) {
    if (chrome.extension.lastError) {
      $scope.$emit('msg:status', { state: StateEnum.NO_TAB });
    }
    $scope.$emit('msg:status', response);
  }

  $scope.$on('np-service:updated', (event, np) => {
    $scope.setState(np.state);
    $scope.changeColor($scope.colors[np.status.protocol]);
    if ($scope.status.slider_dragging === true) {
      np.status = _.omit(np.status, 'current_time_s', 'current_time');
    }
    $scope.$apply(() => {
      $scope.np = _.extend({}, $scope.np, np);
    });
  });

  function routeInterfaceMsg(msg) {
    if (msg.type === 'status') {
      update(msg.data);
    } else {
      if (msg.type === 'artists' || msg.type === 'albums') {
        $scope.data[msg.type] = $scope.data[msg.type].slice(0, msg.offset).concat(msg.data);
        $scope.status.scrolling_busy = false;
        $scope.counts[msg.type] = msg.count;
      } else if (msg.type === 'playlists') {
        $scope.data.playlists.myPlaylists = $scope.data.playlists.myPlaylists.slice(0, msg.offset).concat(msg.data.myPlaylists);
        $scope.data.playlists.autoPlaylists = msg.data.autoPlaylists;
        $scope.data.playlists.recentPlaylists = msg.data.recentPlaylists;
        $scope.status.scrolling_busy = false;
        $scope.counts.playlists = msg.count;
      } else if (msg.type === 'search') {
        $scope.data.search = msg.data;
      } else if (msg.type === 'artist') {
        $scope.data.artist = msg.data;
        $scope.data.title = msg.title;
      } else if (msg.type === 'playlist') {
        $scope.data.playlist = msg.data;
        $scope.data.title = msg.title;
        $scope.data.subtitle = msg.subtitle;
      } else {
        $scope.data[msg.type] = msg.data;
      }
      $scope.data.last_history = msg.history;
      $scope.status.displayed_content = msg.type;
    }
  }

  const init = function() {
    $scope.backgroundPort = chrome.runtime.connect({ name: 'popup' });
    $scope.backgroundPort.onMessage.addListener(msg => {
      if (msg.type === 'connect') {
        $scope.interfacePort = chrome.tabs.connect(msg.id, { name: 'popup' });
        $scope.interfacePort.id = msg.id;
        $scope.interfacePort.onDisconnect.addListener(() => {
          $scope.interfacePort = null;
          $scope.$apply(() => {
            $scope.setState(StateEnum.NO_TAB);
          });
        });
        $scope.interfacePort.onMessage.addListener(routeInterfaceMsg);
        $scope.$apply(() => {
          $scope.setState(StateEnum.NO_SONG);
        });
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      $scope.$apply(() => {
        if (area === 'sync') {
          if (changes['notifications-enabled']) {
            $scope.settings['notifications-enabled'] = changes['notifications-enabled'].newValue;
          }
          if (changes['shortcuts-enabled']) {
            $scope.settings['shortcuts-enabled'] = changes['shortcuts-enabled'].newValue;
          }
          if (changes['scrobbling-enabled']) {
            $scope.settings['scrobbling-enabled'] = changes['scrobbling-enabled'].newValue;
          }
          if (changes.lastfm_sessionID) {
            $scope.settings.lastfm_sessionID = changes.lastfm_sessionID.newValue;
          }
        }
      });
    });
  };

  init();
}]);
