popupApp.factory('InputManager', ['$interval', '$rootScope', ($interval, $rootScope) => {
  const colors = {
    gmusic: '#ff5722',
    pandora: '#455774',
    spotify: '#84bd00',
    none: 'rgb(244, 67, 54)'
  };

  const state = {
    volPressed: false,
    playlistPressed: false,
    sliderDragging: false,
    displayedContent: '',
    scrollingBusy: false,
    drawerOpen: false
  };

  return {
    get(key) {
      return key ? state[key] : state;
    },
    set(key, value) {
      state[key] = value;
      return $rootScope.$broadcast('input-manager:updated', state);
    }
  };
}]);
