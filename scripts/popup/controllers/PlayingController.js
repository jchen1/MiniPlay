angular.module('app').controller('PlayingController', function($scope, $state, CommService, NPService, InputManager, SettingsManager) {
  let np = NPService.get();

  $scope.getAlbumArt = function() {
    const gradientString = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0)), no-repeat ';
    return {
      'background-image': `${np.state === StateEnum.PLAYING ? '' : gradientString}url(${np.status.album_art})`
    };
  };

  $scope.activeRepeat = function() {
    return np.status.repeat === RepeatEnum.NONE ? '' : 'art-control-active';
  };

  $scope.activeShuffle = function() {
    return np.status.shuffle ? 'art-control-active' : '';
  };

  $scope.isDisabled = function(type) {
    return np.state !== StateEnum.PLAYING || np.status.disabled[type];
  };

  $scope.getRepeatIcon = function() {
    return (np.status.repeat === RepeatEnum.ONE) ? 'repeat_one' : 'repeat';
  };

  $scope.clickArt = function() {
    if (CommService.isConnected()) {
      chrome.tabs.update(CommService.getTabId(), { highlighted: true });
      chrome.tabs.get(CommService.getTabId(), tab => {
        chrome.windows.update(tab.windowId, { focused: true });
      });
    }
  };

  $scope.$on('np-service:updated', (event, _np) => {
    $scope.$apply(() => {
      np = _np;
    });
  });
});
