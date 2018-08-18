vsapp.controller('operationsController', operationsController)

operationsController.$inject = ['$scope', '$mdDialog', 'DataFactory', 'idFactory', 'OperationService', 'ClientService'];


function operationsController($scope, $mdDialog, DataFactory, idFactory, OperationService, ClientService) {

    $scope.operations = [];

    $scope.createModel = function () {
        var model = {
            ModelName: '',
            LastModified: '',
            Description: '',
            PeriodStart: '',
        }
        var items = {
            model: model,
            mode: 'createModel'
        }
        console.log("create model function")
        $mdDialog.show({
            controller: 'demandEditController',
            templateUrl: '/partials/modelEdit',
            clickOutsideToClose: true,
            fullscreen: true,
            dialogLocals: items
        }).then(function (model) {
            console.log("modeledit dialog closed returning", model);

        });

    }

    $scope.addOperation = function (model) {
        console.log("operation add model", model);
        var operation = {
            ModelID: model._id,
            Type: '',
            IsIncluded: true,
            RegionID: 1,
            Name: '',
            WorkCenters: [],
            Description: ''
        }

        var items = {
            modelID: model._id,
            operation: operation,
            periodStart: new Date(model.PeriodStart),
            mode: 'create'
        }

        $mdDialog.show({
            controller: 'demandEditController',
            templateUrl: '/partials/operationEdit',
            clickOutsideToClose: true,
            fullscreen: true,
            dialogLocals: items
        }).then(function (newOperation) {
            console.log("operation dialog closed returning", newOperation);

        });

    }

    $scope.selectModel = function (model) {
        console.log("add code for selecgting a model")


    }

    $scope.addWorkCenter = function (ev, model, operation) {
        console.log('addworkcenter ev, model, operation', ev, model, operation);
        var workcenter = {
            Name: '',
            OperationID: operation._id,
            ModelID: operation.ModelID,
            Cost: {},
            Downtime: {}
        }

        _.each(model.Periods, function (period) {
            workcenter.Cost[period] = 0;
            workcenter.Downtime[period] = 0;
        })

        // var trackingDate = angular.copy(new Date(model.PeriodStart));
        // for (var i = 0; i < 60; i++) {
        //     workcenter.Cost[trackingDate.getTime()] = 0;
        //     workcenter.Downtime[trackingDate.getTime()] = 0;
        //     trackingDate.setMonth(trackingDate.getMonth() + 1);
        // }

        var items = {
            operation: operation,
            workcenter: workcenter,
            mode: 'create',
            periodStart: new Date(model.PeriodStart)
        }

        $mdDialog.show({
            controller: 'demandEditController',
            templateUrl: '/partials/workcenters',
            clickOutsideToClose: true,
            fullscreen: true,
            targetEvent: ev,
            dialogLocals: items
        }).then(function (newWorkcenter) {
            console.log("workcenter dialog closed returning", newWorkcenter);

        });
    }

    $scope.editOperation = function (event, model, operation) {
        console.log('add code to edit operation ', event, model, operation);
    }

    $scope.deleteOperation = function (event, model, operation) {
        console.log('add code to delete operation ', event, model, operation);
    }



    $scope.editModel = function (event, model) {
        console.log('add code to edit Model', event, model);

    }

    $scope.deleteModel = function ($event, model) {
        console.log('add code to delete Model', event, model);

    }

    $scope.$on('modelAdded', function (model) {
        //$scope.loadGroups();
        $scope.loadModels();
        console.log('op controller $on modelAdded ', model)
    });

    $scope.$on('operationAdded', function (event, operation) {
        //$scope.loadGroups();

        $scope.loadOperations(operation.ModelID);
        console.log('op controller received $on operationsAdded  for operation', operation, event);
    });

    $scope.$on('workcenterAdded', function (event, workcenter) {
        //$scope.loadGroups();

        $scope.loadOperations(workcenter.ModelID);
        console.log('op controller received $on operationsAdded  for operation', workcenter, event);
    });



    $scope.loadOperations = function (modelID) {

        OperationService.getOperations(modelID).then(function (response) {
            console.log("operations returned from loadOperations", response);
            $scope.operations = [];
            _.each(response.data, function (operation) {
                $scope.operations.push(operation);
            });
        });
    }

    $scope.loadModels = function () {
        OperationService.getModels().then(function (response) {
            console.log("models returned on loadModels", response);
            $scope.models = [];
            if (response.data[0]) {
                _.each(response.data, function (model) {
                    if (model.Periods.length > 0) {
                        _.each(model.Periods, function (period) {
                            console.log("period", period);
                        })
                    }
                    $scope.models.push(model);
                    $scope.loadOperations(model._id)
                });

            } else {
                console.log("no models found")
            }

        });
    }



    $scope.init = function () {
        console.log("ClientService", ClientService.models, ClientService.operations);
        $scope.loadModels();
    }();
};