const controller = popupApp.controller('PopupController', ['$scope', 'CommService', 'NPService', 'InputManager', 'SettingsManager', function($scope, CommService, NPService, InputManager, SettingsManager) {
  $scope.InputManager = InputManager;
  $scope.SettingsManager = SettingsManager;
  $scope.np = NPService.get();

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

  $scope.counts = {};

  $scope.repeat_icon = function() {
    return ($scope.np.status.repeat === RepeatEnum.ONE) ? 'repeat_one' : 'repeat';
  };

  $scope.menu_icon = function() {
    return (InputManager.get('displayed_content') === '' || InputManager.get('displayed_content') === 'current_playlist') ? 'menu' : 'arrow_back';
  };

  $scope.menu_icon_click = function() {
    if ($scope.np.status.protocol === 'gmusic') {
      if (InputManager.get('displayed_content') === '' || InputManager.get('displayed_content') === 'current_playlist') {
        InputManager.set('drawer_open', true);
      } else {
        InputManager.set('drawer_open', false);

        if ($scope.data.view_stack.length > 0) {
          const oldView = $scope.data.view_stack.pop();
          InputManager.set('displayed_content', oldView.content);
          $scope.data.title = oldView.title;
          $scope.data.subtitle = oldView.subtitle;
        } else {
          InputManager.set('displayed_content', '');
          $scope.data.title = '';
          $scope.data.subtitle = '';
        }
      }
    } else {
        // todo: something??
    }
  };

  $scope.should_show_art = function() {
    return (InputManager.get('playlist_pressed') === false && InputManager.get('displayed_content').length === 0);
  };

  $scope.album_art_background = function() {
    return `${$scope.np.state === StateEnum.PLAYING ? '' : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0)), no-repeat '}url(${$scope.np.status.album_art})`;
  };

  $scope.artist_background = function(image) {
    return `url(${image}) center / cover`;
  };

  $scope.search = function() {
    CommService.postMessage(
      {
        action: 'search',
        query: $scope.data.query
      });
    $scope.data.title = `Search: ${$scope.data.query}`;
    InputManager.set('displayed_content', 'loading');
    InputManager.set('playlist_pressed', false);
    InputManager.set('drawer_open', false);
  };

  $scope.setState = function(s) {
    switch (s) {
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

  $scope.playlist_click = function(id) {
    CommService.postMessage({
      action: 'dataClick',
      click_type: 'playlist',
      id,
      history: $scope.data.last_history
    });
  };

  $scope.settings_click = function($event) {
    InputManager.set('displayed_content', 'options');
    InputManager.set('drawer_open', false);
    $scope.data.title = 'options';
  };

  $scope.dataClick = function(type, data) {
    const oldContent = InputManager.get('displayed_content');
    if (CommService.isConnected() && $scope.np.status.protocol === 'gmusic') {
      InputManager.set('displayed_content', 'loading');

      switch (type) {
        case 'recent':
          InputManager.set('displayed_content', '');
          $scope.data.title = '';
          $scope.data.subtitle = '';
        case 'album':
        case 'artist':
          CommService.postMessage(
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
          CommService.postMessage(
            {
              action: 'dataClick',
              click_type: 'station',
              station_type: type,
              index: data.index,
              history: $scope.data.last_history,
            });
          InputManager.set('displayed_content', '');
          $scope.data.title = '';
          $scope.data.subtitle = '';
          break;
        case 'recent_playlist':
        case 'auto_playlist':
        case 'my_playlist':
          CommService.postMessage(
            {
              action: 'dataClick',
              click_type: 'playlists',
              playlist_type: type,
              index: data.index,
              history: $scope.data.last_history,
            });
          InputManager.set('displayed_content', '');
          $scope.data.title = '';
          $scope.data.subtitle = '';
          break;
        default:
          break;
      }
    }
  };

  $scope.drawer_click = function(clicked) {
    CommService.postMessage({
      action: `get${clicked}`,
      offset: 0
    });

    if (clicked !== 'library') {
      InputManager.set('displayed_content', 'loading');
      $scope.data.title = clicked;
      $scope.data.view_stack.length = 0;
    } else {
      InputManager.set('displayed_content', '');
      $scope.data.title = '';
      $scope.data.subtitle = '';
    }

    InputManager.set('playlist_pressed', false);
    InputManager.set('drawer_open', false);
  };

  $scope.album_art_click = function() {
    if (CommService.isConnected()) {
      chrome.tabs.update(CommService.getTabId(), { highlighted: true });
      chrome.tabs.get(CommService.getTabId(), tab => {
        chrome.windows.update(tab.windowId, { focused: true });
      });
    }
  };

  $scope.clear_stack = function() {
    $scope.data.view_stack.length = 0;
    InputManager.set('displayed_content', '');
    $scope.data.title = '';
    $scope.data.subtitle = '';
  };

  $scope.scroll_data = function(contentType) {
    CommService.postMessage({
      action: `get_${contentType}`,
      offset: (contentType === 'stations' ? 0 : $scope.data[contentType].length)
    });
    InputManager.set('scrolling_busy', true);
  };

  $scope.lastfm_auth = function() {
    chrome.runtime.sendMessage({ type: 'auth' }, response => {});
  };

  $scope.launch_settings = function() {
    chrome.tabs.create({ url: 'chrome://extensions/configureCommands' });
  };

  $scope.should_disable_scroll = function() {
    if (InputManager.get('scrolling_busy')) return true;


    if (InputManager.get('displayed_content') === 'stations') {
      // TODO
      return true;
    }
    return $scope.counts[InputManager.get('displayed_content')] === $scope.data[InputManager.get('displayed_content')].length;
  };

  $scope.is_song_playing = function(song) {
    return (song.title === $scope.np.status.title &&
              song.artist === $scope.np.status.artist &&
              song.album === $scope.np.status.album);
  };

  $scope.is_drawer_open = function() {
    return $('.mdl-layout__drawer').hasClass('is-visible');
  };

  $scope.handleKey = function($event) {
    if (!$('.mdl-layout__drawer').hasClass('is-visible') && $event.keyCode === 32) {
      $scope.np.status.status = !$scope.np.status.status;
      CommService.postMessage({
        action: 'sendCommand',
        type: 'play'
      });
    } else if (!$('.mdl-layout__drawer').hasClass('is-visible') && $event.keyCode === 8) {
      if ($scope.data.view_stack.length > 0) {
        const oldView = $scope.data.view_stack.pop();
        InputManager.set('displayed_content', oldView.content);
        $scope.data.title = oldView.title;
        $scope.data.subtitle = oldView.subtitle;
      } else {
        InputManager.set('displayed_content', '');
        $scope.data.title = '';
        $scope.data.subtitle = '';
      }
    }
  };

  function changeColor(oldColor, newColor) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].href) {
        $.each(document.styleSheets[i].cssRules, (index, rule) => {
          if (rule && rule.style && rule.cssText.indexOf(oldColor) !== -1) {
            rule.style.cssText = rule.style.cssText.replace(oldColor, newColor);
          }
        });
      }
    }
  }

  $scope.$on('$includeContentLoaded', (event, src) => {
    componentHandler.upgradeDom();
  });

  $scope.$on('np-service:updated', (event, np) => {
    $scope.setState(np.state);
    if (np.status.oldColor !== np.status.color) {
      changeColor(np.status.oldColor, np.status.color);
    }
    if (InputManager.get('slider_dragging') === true) {
      np.status = _.omit(np.status, 'current_time_s', 'current_time');
    }
    $scope.$apply(() => {
      $scope.np = _.extend({}, $scope.np, np);
    });
  });

  $scope.$on('comm-service:connect', () => {
    $scope.$apply(() => {
      $scope.setState(StateEnum.NO_SONG);
    });
  });

  $scope.$on('comm-service:disconnect', () => {
    $scope.$apply(() => {
      $scope.setState(StateEnum.NO_TAB);
    });
  });

  // temporary until controllers are split up
  function routeInterfaceMsg(msg) {
    if (msg.type !== 'status') {
      if (msg.type === 'artists' || msg.type === 'albums') {
        $scope.data[msg.type] = $scope.data[msg.type].slice(0, msg.offset).concat(msg.data);
        InputManager.set('scrolling_busy', false);
        $scope.counts[msg.type] = msg.count;
      } else if (msg.type === 'playlists') {
        $scope.data.playlists.myPlaylists = $scope.data.playlists.myPlaylists.slice(0, msg.offset).concat(msg.data.myPlaylists);
        $scope.data.playlists.autoPlaylists = msg.data.autoPlaylists;
        $scope.data.playlists.recentPlaylists = msg.data.recentPlaylists;
        InputManager.set('scrolling_busy', false);
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
      InputManager.set('displayed_content', msg.type);
    }
  }

  function init() {
    CommService.init();
    CommService.addInterfaceListener('controller', routeInterfaceMsg);

    SettingsManager.init();
  }

  init();
}]);
