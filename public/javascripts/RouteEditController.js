vsapp.controller('RouteEditController', ['$scope', '$mdDialog', 'dialogLocals', function ($scope, $mdDialog, dialogLocals) {
    $scope.active = {};
    $scope.active.stepName;
    $scope.active.operation;

    $scope.close = function () {

        $mdDialog.hide();
    }

    $scope.save = function () {
        // CommService.unitEdited($scope.units);
        if (!$scope.active.operation || !$scope.active.stepName) {

        } else {
            $mdDialog.hide($scope.active);
        }

    }

    $scope.operations = dialogLocals.operations;
    $scope.processSteps = dialogLocals.processSteps;

    // $scope.selectOperation = function(operation){
    //     $scope.active.operation = operation;
    //     console.log("routeEditcontroller operationselected", $scope.active)
    // }
}]);