const TabbedController = angular.module('app').controller('TabbedController', function($scope, $state, CommService, NPService, InputManager, SettingsManager, data) {
  $scope.selectedTab = 0;

  $scope.shouldTab = function() {
    return _.size(data.tabs) > 1;
  };

  $scope.getTabs = function() {
    return data.tabs;
  };

  $scope.selectTab = function(index) {
    $scope.selectedTab = index;
    $state.go(`tabbed.${data.tabs[index].displayType}`, { tabIndex: index });
  };

  function init() {
    $state.go(`tabbed.${_.first(data.tabs).displayType}`, { tabIndex: 0 });
  }

  init();
});
