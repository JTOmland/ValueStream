vsapp.controller('operationsController', operationsController)

operationsController.$inject = ['$scope','$mdDialog','DataFactory'];


function operationsController ($scope, $mdDialog, DataFactory) {

		$scope.operation = {CFModelID: 151, SiteID: 0, SitenName:'', IsIncluded: true, RegionID: ''};

		$scope.addOperation = function(){
            console.log("operation", $scope.operation);
            _.each($scope.operation, function(item){
                console.log(item);
            });
            if(!_.includes($scope.operations, $scope.operation)){
                $scope.operations.push($scope.operation);
            }
			
        }
        
        $scope.selectModel = function(model) {
            console.log("add code for selecgting a model")
            

        }

        $scope.addWorkCenter = function(ev, model, operation) {
            if(!operation.workcenters) {
                operation.workcenters = [];
            }
            var items = {
                model: model,
                operation: operation
            }

            $mdDialog.show({
                controller: 'workcenterController',
                templateUrl: '/partials/workcenters',
                clickOutsideToClose: true,
                fullscreen: true,
                targetEvent: ev,
                dialogLocals: items
            }).then(function(newWorkcenter) {
                console.log("workcenter dialog closed returning", newWorkcenter);
                if(newWorkcenter) {
                    operation.workcenters.push(newWorkcenter);
                }
                //$scope.loadFacets(group);
            });
            console.log('adding workcenter')
        }

        $scope.editOperation= function(event,model, operation) {
            console.log('add code to edit operation ', event, model, operation);
        }

        $scope.deleteOperation = function(event, model, operation) {
            console.log('add code to delete operation ', event, model, operation);
        }

        $scope.addOperation = function(event, model) {
            console.log('add code to add operation ', event, model);

        }

        $scope.editModel = function(event, model){
            console.log('add code to edit Model', event, model);

        }

        $scope.deleteModel = function($event, model) {
            console.log('add code to delete Model', event, model);

        }


        $scope.init = function(){
            $scope.timePeriods = DataFactory.getTimePeriods();
            $scope.processModel = DataFactory.processModel();
            $scope.demandModel = DataFactory.demandModel();
            $scope.operations = DataFactory.siteModel();
            $scope.workCenterModel = DataFactory.workCenterModel();
            $scope.productModel = DataFactory.productModel();
            $scope.models = [];
            $scope.model = DataFactory.fullModel();
            $scope.models.push($scope.model);
            console.log("Model", $scope.model)
        }();
	};