const TabbedGridController = angular.module('app').controller('TabbedGridController', function($scope, CommService, NPService, InputManager, SettingsManager, data, tabIndex) {
  function init() {
    // $state.go(`tabbed.${_.first(data.tabs).displayType}`, _.first(data.tabs));
    $scope.tab = data.tabs[tabIndex];
  }

  init();
});
