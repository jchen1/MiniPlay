const TabbedGridController = angular.module('app').controller('TabbedGridController', function($scope, CommService, NPService, InputManager, SettingsManager, data, tabIndex) {
  let isScrolling = false;

  $scope.getTileClass = item => {
    if (item.style === 'circle') return 'grid-tile__circle';
    return 'grid-tile__square';
  };

  $scope.scrollData = () => {
    if (_.size($scope.tab.data) < $scope.tab.count) {
      isScrolling = true;
      return CommService.postMessage({
        action: `get${$scope.tab.name}`,
        offset: _.size($scope.tab.data),
        datatype: $scope.tab.datatype
      }).then(msg => {
        $scope.$apply(() => {
          $scope.tab.data = _.concat($scope.tab.data, msg.tabs[tabIndex].data);
        });
        isScrolling = false;
      });
    }

    return null;
  };

  $scope.showLoader = () => _.size($scope.tab.data) < $scope.tab.count;

  $scope.isScrollingDisabled = () => _.size($scope.tab.data) === $scope.tab.count || isScrolling;

  function init() {
    $scope.tab = data.tabs[tabIndex];
  }

  init();
});
