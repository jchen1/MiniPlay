const TabbedListController = angular.module('app').controller('TabbedListController', function($scope, CommService, NPService, InputManager, SettingsManager, data, tabIndex) {
  let isScrolling = false;

  $scope.getLIClass = item => {
    if (item.text) return 'md-3-line';
    else if (item.subheading) return 'md-2-line';
    return 'md-1-line';
  };

  $scope.scrollData = () => {
    if (_.size($scope.tab.data) < $scope.tab.count) {
      isScrolling = true;
      return CommService.postMessage({
        action: 'getArtists',
        offset: $scope.tab.offset,
        tabId: $scope.tab.tabId
      }).then(msg => {
        $scope.$apply(() => {
          $scope.tab.data = _.concat($scope.tab.data, msg.tabs[tabIndex].data);
          $scope.tab.offset = _.size($scope.tab.data);
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
    $scope.tab.offset = _.size($scope.tab.data);
  }

  init();
});
