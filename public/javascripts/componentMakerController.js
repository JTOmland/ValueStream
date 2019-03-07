vsapp.controller('componentMakerController', ['$scope', '$mdDialog', 'dialogLocals', 'OperationService', 'BrokerService','$element', function ($scope, $mdDialog, dialogLocals, OperationService, BrokerService, $element) {
    $scope.active = {};
    $scope.operations = dialogLocals.operations;
    //$scope.processStep = dialogLocals.processStep;
    console.log("dialogLocals", dialogLocals);
    $scope.setFocus = function(){
        console.log("setFocus run")
        var currentElement = angular.element('#projectName');
        console.log("currentElement", currentElement);
        currentElement.focus();
    }

    if (dialogLocals.project) {
        $scope.active = angular.copy(dialogLocals.project);

    }
    if (dialogLocals.mode == 'create'){
        $scope.active.type = "Area Of Responsibility";
    }
    console.log('$scope.active before edit', $scope.active);
    console.log("parent", dialogLocals.parent);

    $scope.close = function () {
        $mdDialog.hide();
    }

    $scope.save = function () {
        // CommService.unitEdited($scope.units);
        console.log("saving processStep is ", $scope.active)
        //todod this can be changed cleaned up.  do update component then do the if and use the response data for either.

        if (dialogLocals.mode == 'create') {
            $scope.active.type = 'AOR';
            console.log('saving with no parent so not adding to a parent');
            console.log('create component operationservice call', $scope.active);
            OperationService.updateComponent($scope.active).then(function (response) {
                console.log("operationService.updateComponent returned with data", response.data);
                BrokerService.outputAdded(response.data);
                $mdDialog.hide(response.data);
            });

        } else {
            console.log('create component operationservice call', $scope.active);
            OperationService.updateComponent($scope.active).then(function (response) {
                console.log("operationService.updateComponent returned with data", response.data);
                console.log('Calling BrokerService and sending $scope.operation')
                if (dialogLocals.parent) {
                    console.log("added item has a parent.  Pushing response step into parent and updating. Parent", dialogLocals.parent);
                    var inputStructure = { item: response.data._id, amount: 1 }//one by default and can be increased or decreasted later
                    console.log("inputStructure", inputStructure);
                    console.log("dialogLocals.parent", dialogLocals.parent);
                    dialogLocals.parent.usages.push(inputStructure);
                    dialogLocals.parent.inputs.push(response.data._id)
                    OperationService.updateComponent(dialogLocals.parent).then(function (parent) {
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
        // var structure = {ParentID:"", Usage: []};
        // structure.ParentID = inputID;

        // _.each(dialogLocals.periods, function(value, key){
        //     var toPush = {period:'', amount:1};
        //     console.log("for each dialogLocals.periods, key value", key, value);
        //     toPush.period = value;
        //     toPush.amount = 1;
        //     structure.Usage.push(toPush);
        // });
        // console.log("fillDebaultInput about to return", structure);
        // return structure;

    }


    function fillDefaultWorkCenterInformation(workcenter) {

        // var structure = {
        //     WorkCenterID: '',
        //     WorkCenterName: '',
        //     WorkCenterInformation: []
        // }
        // console.log("filldefault", workcenter);
        // structure.WorkCenterID = workcenter._id;
        // structure.WorkCenterName = workcenter.Name;
        // _.each(workcenter.Cost, function (value, key) {
        //     var toPush = { period: key, cost: 0, rate: 0, loading: 0, demand: 0, hours: 0 };
        //     structure.WorkCenterInformation.push(toPush);
        // });
        // return structure;
    }

}]);