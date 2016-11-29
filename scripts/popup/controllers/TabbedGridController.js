const TabbedGridController = angular.module('app').controller('TabbedGridController', function($scope, CommService, NPService, InputManager, SettingsManager, data, tabIndex) {
  $scope.getTileClass = item => {
    if (item.style === 'circle') return 'grid-tile__circle';
    return 'grid-tile__square';
  };

  function init() {
    // $state.go(`tabbed.${_.first(data.tabs).displayType}`, _.first(data.tabs));
    $scope.tab = data.tabs[tabIndex];
    console.log($scope.tab);
  }

  init();
});
