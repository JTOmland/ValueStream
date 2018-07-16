vsapp.controller('demandEditController', demandEditController)

demandEditController.$inject = ['$scope', '$mdDialog', 'dialogLocals'];


function demandEditController($scope, $mdDialog, dialogLocals) {

    
    if(dialogLocals.product) {
        $scope.product = dialogLocals.product;
        $scope.periods = dialogLocals.model.PeriodModelItems;  
        console.log("product from dialogLocals", $scope.product)
    }
    $scope.demand = {
        "DemandID": 7377,
        "CPModelID": 151,
        "ProductID": 997,
        "ProductName": "HG Matte Prism 2 mil",
        "SiteID": 1047,
        "SiteName": "DMSD",
        "PeriodID": 1778,
        "DueDate": "2016-M-03",
        "Quantity": "4600"
    }

    $scope.closeDemandEdit = function() {
        $mdDialog.hide();
    }

    $scope.addDemand = function () {
        
        console.log("demand", $scope.demand);
        if($scope.demand.DueDate){
            $mdDialog.hide($scope.demand);
        }

       // $scope.workCenterModel.push($scope.workcenter);
    }
};