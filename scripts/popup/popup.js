angular.module('app', ['ui.router']);

angular.module('app').config(($compileProvider, $stateProvider) => {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
  const states = {
    nowPlaying: {
      templateUrl: 'templates/nowPlaying.html'
    },
    playlist: {
      templateUrl: 'templates/playlist.html'
    },

  }
  $stateProvider.state('nowPlaying', {
    templateUrl: 'templates/nowPlaying.html'
  });
});

// allow HTML to access enums
angular.module('app').run($rootScope => {
  $rootScope.StateEnum = StateEnum;
  $rootScope.RepeatEnum = RepeatEnum;
  $rootScope.ThumbEnum = ThumbEnum;
  $rootScope.StatusEnum = StatusEnum;
});
