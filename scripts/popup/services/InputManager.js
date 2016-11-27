popupApp.factory('InputManager', ['$interval', '$rootScope', ($interval, $rootScope) => {
  const colors = {
    gmusic: '#ff5722',
    pandora: '#455774',
    spotify: '#84bd00',
    none: 'rgb(244, 67, 54)'
  };

  const state = {
    vol_pressed: false,
    playlist_pressed: false,
    slider_dragging: false,
    displayed_content: '',
    scrolling_busy: false,
    drawer_open: false,
    current_color: colors.none  // TODO move to npService
  };

  return {
    get(key) {
      return key ? state[key] : state;
    },
    set(key, value) {
      if (key === 'current_color') {
        value = colors[value] || colors.none;
      }
      state[key] = value;
      return $rootScope.$broadcast('input-manager:updated', state);
    }
  };
}]);
