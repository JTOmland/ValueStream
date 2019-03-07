vsapp.controller('NewActionController', NewActionController)

NewActionController.$inject = ['$scope', '$mdDialog', 'dialogLocals', 'OperationService', 'BrokerService'];


function NewActionController($scope, $mdDialog, dialogLocals, OperationService, BrokerService) {

    //variables used to build scroller 
    $scope.selectedYear = 0;
    $scope.years = [];
    $scope.items = [];
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth();
    var previousYear = -1;
    var previousMonth = -1;
    $scope.contexts = [];
    $scope.selectedContext = undefined;
    $scope.selectedProject = undefined;

    $scope.getSelectedContext = function() {
        console.log("inside get selectedContext", $scope.selectedContext) 
        if($scope.selectedContext) {
            console.log("returning context")
            
            return $scope.selectedContext;
        } else {
            console.log('returning no context')
            return 'Context';
        }
    }

    $scope.getSelectedProject = function() {
        if($scope.selectedProject) {
            $scope.action.project = $scope.selectedProject;
            return $scope.action.project;
        } else {
            console.log('returning no context')
            return 'Project';
        }
    }



    $scope.originalItem = {};


    if (dialogLocals.action) {
        $scope.action = dialogLocals.action;
    }
    if (dialogLocals.projects) {
        $scope.projects = dialogLocals.projects;
        console.log("setting projects", $scope.projects);
    }
    if (dialogLocals.contexts) {
        $scope.contexts = dialogLocals.contexts;
        console.log("setting contexts", $scope.contexts);

    }
    
    $scope.closeEdit = function () {

        $mdDialog.hide($scope.originalItem);
    }

    $scope.closeOperationEdit = function () {
        console.log("close operation edit original item", $scope.originalItem);
        $mdDialog.hide($scope.originalItem);
    }

    $scope.closeModelEdit = function () {

    }

    $scope.createModel = function () {
        console.log("createModel", $scope.model);
        OperationService.addModel($scope.model).then(function (data) {
            BrokerService.modelAdded(data);
            $mdDialog.hide(data)
        });

    }

    $scope.editModel = function () {

    }

    $scope.createOperation = function () {
        console.log('creatOperation button', $scope.operation);
        OperationService.updateOperation($scope.operation).then(function (data) {
            console.log("demand edit createOperaiton call to OperationsService returned with data", data);
            console.log('Calling BrokerService and sending $scope.operation')
            BrokerService.operationAdded($scope.operation);
            $mdDialog.hide(data);
        });

    }

    $scope.editOperation = function () {

    }

    $scope.createProduct = function () {
        $mdDialog.hide($scope.product);
    }

    $scope.editProduct = function () {
        // console.log("before dialogLocal.product", dialogLocals.product, $scope.product)
        // dialogLocals.product = angular.copy($scope.product)
        // console.log("after dialogLocal.product", dialogLocals.product, $scope.product)

        $mdDialog.hide($scope.action);
    }

    $scope.createWorkcenter = function () {
        //need to create a workcenter and then update the operation
        console.log('creatworkcenter button created workcenter and pushed into operation for update', $scope.operation);
        $scope.operation.WorkCenters.push($scope.workcenter)
        OperationService.updateWorkCenter($scope.workcenter).then(function (data) {
            BrokerService.workcenterAdded($scope.workcenter);
            $mdDialog.hide(data);
        });
    }

    $scope.editWorkcenter = function () {
        $mdDialog.hid($scope.workcenter);
    }

    if (!dialogLocals.mode == 'createModel') {
        //this builds the information used for the scroller years and months


    }


    function convertDate(year, month) {
        //item.month and item.year
        month++;
        var buildDateString = month;
        buildDateString += " 1, ";
        buildDateString += year;
        buildDateString += " 00:00:00";
        return new Date(buildDateString);
    }

};