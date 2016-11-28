const footerController = popupApp.controller('FooterController', ['$scope', 'CommService', 'NPService', 'InputManager', 'SettingsManager', function($scope, CommService, NPService, InputManager, SettingsManager) {
  $scope.np = NPService.get();
  $scope.InputManager = InputManager;
  $scope.SettingsManager = SettingsManager;

  $scope.playlist_button_pressed = function() {
    InputManager.set('playlist_pressed', !InputManager.get('playlist_pressed'));
    InputManager.set('displayed_content', InputManager.get('playlist_pressed') ? 'current_playlist' : '');
  };

  $scope.vol_pressed = function() {
    InputManager.set('vol_pressed', !InputManager.get('vol_pressed'));
  };

  $scope.state_title = function() {
    return ($scope.np.status.status === StatusEnum.PAUSED) ? 'Play' : 'Pause';
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

  $scope.$on('np-service:updated', (event, np) => {
    if (InputManager.get('slider_dragging') === true) {
      np.status = _.omit(np.status, 'current_time_s', 'current_time');
    }

    $scope.$apply(() => {
      $scope.np = _.extend({}, $scope.np, np);
    });
  });

  $scope.$on('comm-service:connect', () => {
    $scope.$apply(() => {
      $scope.np.state = StateEnum.NO_SONG;
    });
  });

  $scope.$on('comm-service:disconnect', () => {
    $scope.$apply(() => {
      $scope.np.state = StateEnum.NO_TAB;
    });
  });

  function init() {
    CommService.init();
    SettingsManager.init();
  }

  init();
}]);
