vsapp.controller('RouteEditController', ['$scope', '$mdDialog', 'dialogLocals', 'OperationService', 'BrokerService', function ($scope, $mdDialog, dialogLocals, OperationService, BrokerService) {
    $scope.active = {};
    $scope.operations = dialogLocals.operations;
    //$scope.processStep = dialogLocals.processStep;
    if (dialogLocals.processStep) {
        $scope.active = angular.copy(dialogLocals.processStep);

    }
    console.log('scope.active before edit', $scope.active);
    console.log("parent", dialogLocals.parent);

    $scope.close = function () {
        $mdDialog.hide();
    }

    $scope.save = function () {
        // CommService.unitEdited($scope.units);
        console.log("saving processStep is ", $scope.active)
        if (!$scope.active.Name || !$scope.active.Operation) {

        } else {
            if (dialogLocals.mode == 'create') {
                console.log('saving with no parent so filling default workcenter information')
                $scope.active.UsedWorkCenters = fillDefaultWorkCenterInformation($scope.active.Operation.WorkCenters[0]);
                if (dialogLocals.parent) {
                    $scope.active.WhereUsed.push(dialogLocals.parent._id);
                    $scope.active.IsFinishedGood = false;
                }
            }

            console.log('create output operationservice call', $scope.active);
            OperationService.updateOutput($scope.active).then(function (response) {
                console.log("operationService.updateOutput returned with data", response.data);
                console.log('Calling BrokerService and sending $scope.operation')
                if (dialogLocals.parent) {
                    console.log("added step has a parent.  Pushing response step into parent and updating. Parent", dialogLocals.parent);
                    dialogLocals.parent.Inputs.push(response.data._id);
                    OperationService.updateOutput(dialogLocals.parent).then(function (parent) {
                        console.log("returned from parent update and got data", parent.data);
                        BrokerService.outputAdded(parent.data);
                        $mdDialog.hide(parent.data);
                    });

                } else {
                    BrokerService.outputAdded(response.data);
                    $mdDialog.hide(response.data);

                }


            });
        }
    }


    function fillDefaultWorkCenterInformation(workcenter) {
        var wcStructure = {
            WorkCenterID: '',
            Cost: [],
            Rate: [],
            Yield: [],
            Loading: [],
            Demand: [],
            Hours: []

        }
        console.log("filldefault", workcenter);
        wcStructure.WorkCenterID = workcenter._id;
        _.each(workcenter.Cost, function (value, key) {
            var toPush = { Period: key, Amount: 0 };
            wcStructure.Cost.push(toPush);
            wcStructure.Rate.push(toPush);
            wcStructure.Yield.push(toPush);
            wcStructure.Loading.push(toPush);
            wcStructure.Demand.push(toPush);
            wcStructure.Hours.push(toPush)
        });
        return wcStructure;
    }

}]);