vsapp.controller('numberPadController', ['$scope', '$mdDialog', 'dialogLocals', 'OperationService', 'BrokerService', function ($scope, $mdDialog, dialogLocals, OperationService, BrokerService) {
    $scope.active = {};
    console.log('$scope.active before edit', $scope.active);
    console.log("dialoglocals", dialogLocals);
    $scope.total = 1;
    $scope.parent = dialogLocals.parent;
    $scope.child = dialogLocals.child;

    $scope.close = function () {
        $mdDialog.hide();
    }

    $scope.save = function () {
        

    }

    $scope.clickedNumber = function(number){
        console.log("Number and total", number, " ", $scope.total);
        $scope.total += number;

    }


}]);