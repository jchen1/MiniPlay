const footerController = popupApp.controller('FooterController', ['$scope', 'NPService', function($scope, NPService) {
  $scope.np = NPService.get();
}]);
