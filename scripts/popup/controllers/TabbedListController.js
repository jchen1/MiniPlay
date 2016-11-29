const TabbedListController = angular.module('app').controller('TabbedListController', function($scope, CommService, NPService, InputManager, SettingsManager, data, tabIndex) {

  $scope.getLIClass = item => {
    if (item.text) return 'md-3-line';
    else if (item.subheading) return 'md-2-line';
    return 'md-1-line';
  };


  function init() {
    // $state.go(`tabbed.${_.first(data.tabs).displayType}`, _.first(data.tabs));
    $scope.tab = data.tabs[tabIndex];
  }

  init();
});
