const popupApp = angular.module('app', ['ui.router']);

popupApp.config(['$compileProvider', '$stateProvider', function($compileProvider, $stateProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
  $stateProvider.state('test', {
    template: '<h1>HIHIHI</h1>'
  });
}]);

// allow HTML to access enums
popupApp.run($rootScope => {
  $rootScope.StateEnum = StateEnum;
  $rootScope.RepeatEnum = RepeatEnum;
  $rootScope.ThumbEnum = ThumbEnum;
  $rootScope.StatusEnum = StatusEnum;
});
