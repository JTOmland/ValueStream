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
                _.each($scope.active.Operation.WorkCenters, function(wc) {
                    $scope.active.UsedWorkCenters.push(fillDefaultWorkCenterInformation(wc));
                });
                if (dialogLocals.parent) {
                    //make  as structure for where used { ParentID: "", Usages :[period: date, amount: usage]}
                    var parentStruc = fillDefaultUsages(dialogLocals.parent._id);
                    $scope.active.WhereUsed.push(parentStruc);
                    $scope.active.IsFinishedGood = false;
                } else {
                    //fill in default final demand
                    _.each(dialogLocals.periods, function(value, key){
                        var toPush = {period:'', amount:0};
                        toPush.period = value;
                        toPush.amount = 0;
                        $scope.active.Demand.push(toPush);
                    });

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

    function fillDefaultUsages(inputID) {
        var structure = {ParentID:"", Usage: []};
        structure.ParentID = inputID;
       
        _.each(dialogLocals.periods, function(value, key){
            var toPush = {period:'', amount:1};
            console.log("for each dialogLocals.periods, key value", key, value);
            toPush.period = value;
            toPush.amount = 1;
            structure.Usage.push(toPush);
        });
        console.log("fillDebaultInput about to return", structure);
        return structure;

    }


    function fillDefaultWorkCenterInformation(workcenter) {
       
        var structure = {
            WorkCenterID: '',
            WorkCenterName: '',
            WorkCenterInformation: []
        }
        console.log("filldefault", workcenter);
        structure.WorkCenterID = workcenter._id;
        structure.WorkCenterName = workcenter.Name;
        _.each(workcenter.Cost, function (value, key) {
            var toPush = { period: key, cost: 0, rate: 0, loading: 0, demand: 0, hours: 0 };
            structure.WorkCenterInformation.push(toPush);
        });
        return structure;
    }

}]);