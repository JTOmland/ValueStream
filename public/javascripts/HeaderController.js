vsapp.controller('HeaderController', HeaderController)

HeaderController.$inject = ['$scope','$http', '$location', '$mdDialog', 'DataFactory', '$mdSidenav', '$mdToast'];

function HeaderController($scope, $http, $location, $mdDialog, DataFactory, $mdSidenav, $mdToast) {

    $scope.msg = "This is a test alert from header controller";

    $scope.showSimpleToast = function() {
        $mdToast.show(
          $mdToast.simple()
            .textContent($scope.msg)
            .position('top')
            .theme('error-toast')
            .hideDelay(3000)
        );
      };
    
  
    $scope.createVS = function() {

    }
    $scope.openSideNavPanel = function() {
        $mdSidenav('left').open();
    };
    $scope.closeSideNavPanel = function() {
        $mdSidenav('left').close();
    };
    $scope.simulationPage = function(path) {
        console.log("HeaderController simulaiton page")
        $location.url(path);
    }
}
