vsapp.controller('ProductBOMController', ProductBOMController)

ProductBOMController.$inject = ['$scope', '$mdDialog', '$mdToast', '$location', 'ClientService', 'OperationService'];


function ProductBOMController($scope, $mdDialog, $mdToast, $location, ClientService, OperationService) {

    $scope.routes = [];
    $scope.indRoute = {};
    $scope.treeOptions = {

        dropped: function (event) {
            console.log("dropped", event)

            _.each(event.source.nodesScope.$modelValue, function (attr, index) {
                console.log("attr", attr)
                attr.order = index;
            });

            $scope.updateFacets();
        },

        beforeDrop: function (event) {
            console.log('before drop', event)
            var allowDrop = true


            _.each(event.source.nodesScope.$modelValue, function (attr, index) {
                console.log("this is the attr and index", attr, index)
                if (!_.includes(event.dest.nodesScope.$modelValue, attr)) {
                    allowDrop = false;
                };
            });

            if (!allowDrop) {
                // $scope.showDragAndDropError();
            }

            return allowDrop;
        }
    };

    function openDialog(mode, parent){

        var processStep = {
            ModelID: $scope.model._id,
            CustomerID: '',
            ProductFamily: '',
            Description: '',
            Name: '',
            Operation: '',
            Inputs: [],
            IsFinishedGood: true,
            WhereUsed: [],
            UsedWorkCenters: [],
            Demand: []
        }
        var items = {
            operations: $scope.operations,
            parent: parent,
            processStep: processStep,
            mode: mode,
            periods: $scope.model.Periods
        }

        $mdDialog.show({
            controller: 'RouteEditController',
            templateUrl: '/routeEditor',
            clickOutsideToClose: true,
            fullscreen: true,
            targetEvent: event,
            dialogLocals: items
        }).then(function (output) {
            console.log("return from dialog from newValueStream", output);
            if(output) {
                $scope.loadOutputs(output.ModelID);
                // OperationService.getOutput(output._id).then(function(response){
                //     console.log("called for outputID", output._id, "received", response);
                //     $scope.routes.push(response.data);
                // });
               
            } else {
                $scope.showSimpleToast("No process step added!")
            }
        });

    }

    $scope.addStep = function (event, item) {
        console.log("adding step event and item", event, item);
        openDialog('create', item);
    }

    $scope.newValueStream = function () {
        console.log("newValueStreamButton pressed");
        openDialog('create');

    };


    $scope.showSimpleToast = function (msg) {
        var pinTo = 'top right';
        $mdToast.show(
            $mdToast.simple()
                .textContent(msg)
                .position(pinTo)
                .hideDelay(3000)
        );
    };

    $scope.removeStep = function (event, item) {
        console.log("removing step event and item", event, item);
    };

    $scope.editStep = function(event, item) {
        console.log("edit step", event, item);
        ClientService.activeRoute = angular.copy(item);
        var path = '/routeDetails/' + item._id;
        $location.path(path)


    }
    $scope.selectOperation = function (operation) {
        console.log("you selected", operation.SiteName)
    }

    $scope.loadOutputs = function (modelID) {
        OperationService.getFinishedGoodOutputs(modelID).then(function (response) {
            //console.log("response from load outputs", response);
            $scope.routes = [];
            _.each(response.data, function (output) {
                $scope.routes.push(output);
            });
        });
    }



    $scope.init = function () {
        console.log("ClientService", ClientService.models, ClientService.operations, ClientService.finishedGoodOutputs);
        $scope.models = angular.copy(ClientService.models);
        $scope.operations = angular.copy(ClientService.operations);
        $scope.timePeriods = angular.copy($scope.models.Periods);
        $scope.model = $scope.models[0];
        $scope.routes = angular.copy(ClientService.finishedGoodOutputs);
        $scope.loadOutputs($scope.model._id);

        console.log('Init ProductBOMController', $scope.operations);
        console.log('Init ', $scope.models);

    }();

}