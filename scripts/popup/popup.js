const popupApp = angular.module('app', []);

popupApp.config(['$compileProvider', function($compileProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
}]);

// allow HTML to access enums
popupApp.run($rootScope => {
  $rootScope.StateEnum = StateEnum;
  $rootScope.RepeatEnum = RepeatEnum;
  $rootScope.ThumbEnum = ThumbEnum;
  $rootScope.StatusEnum = StatusEnum;
});