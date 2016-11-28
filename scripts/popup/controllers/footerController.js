const footerController = angular.module('app').controller('FooterController', function($scope, CommService, NPService, InputManager, SettingsManager) {
  $scope.np = NPService.get();
  $scope.InputManager = InputManager;
  $scope.SettingsManager = SettingsManager;

  $scope.playlistButtonPressed = function() {
    InputManager.set('playlistPressed', !InputManager.get('playlistPressed'));
    InputManager.set('displayedContent', InputManager.get('playlistPressed') ? 'current_playlist' : '');
  };

  $scope.volPressed = function() {
    InputManager.set('volPressed', !InputManager.get('volPressed'));
  };

  $scope.state_title = function() {
    return ($scope.np.status.status === StatusEnum.PAUSED) ? 'Play' : 'Pause';
  };

  $scope.volumeIcon = function() {
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
    if (InputManager.get('sliderDragging') === true) {
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
});
