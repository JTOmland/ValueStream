vsapp.controller('workcenterController', workcenterController)

workcenterController.$inject = ['$scope', '$mdDialog', 'dialogLocals'];


function workcenterController($scope, $mdDialog, dialogLocals) {


    if(dialogLocals.operation) {
        $scope.operation = dialogLocals.operation;    
    }
    $scope.workcenter = {
        "SiteID": $scope.operation.SiteID,
        "WorkCenterID": 2,
        "WorkCenterType": "Existing",
        "WorkCenterName":"",
        "IsIncluded": false,
        "ExperimentTime": [],
        "OperatingCost": []
    }

    $scope.closeWorkcenterEdit = function() {
        $mdDialog.hide();
    }

    $scope.addWorkcenter = function () {
        
        console.log("workcenter", $scope.workcenter);
        if($scope.workcenter.WorkCenterName){
            $mdDialog.hide($scope.workcenter);
        }

       // $scope.workCenterModel.push($scope.workcenter);
    }
};