vsapp.controller('routeController', routeController)

routeController.$inject = ['$scope', '$mdDialog', '$mdToast', '$rootScope', 'ClientService', 'OperationService'];


function routeController($scope, $mdDialog, $mdToast, $rootScope, ClientService, OperationService) {

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
            UsedWorkCenters: []
        }
        var items = {
            operations: $scope.operations,
            parent: parent,
            processStep: processStep,
            mode: mode
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

    $scope.editStop = function(event, item) {

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

  
    
    // function fillSubRoute(route) {
    //     console.log("fillSubRoute route", route);
    //     var tempRoute = {};
    //     tempRoute.id = route.id;
    //     tempRoute.title = route.title;
    //     tempRoute.nodes = [];
    //     var workingRoute = {};
    //     while (route.nodes.length > 0) {
    //         var routeSubID = route.nodes.pop();
    //         console.log("rourteSubID", routeSubID)
    //         var uoRouteIndex = _.findIndex($scope.unorderedRoutes, function (o) {
    //             return o.id == routeSubID
    //         });

    //         if (uoRouteIndex > -1) {
    //             console.log("uoroute", $scope.unorderedRoutes[uoRouteIndex])
    //             tempRoute.nodes.push($scope.unorderedRoutes[uoRouteIndex]);
    //             workingRoute = angular.copy($scope.unorderedRoutes[uoRouteIndex]);
    //             fillSubRoute(workingRoute);
    //         };

    //     }
    //     console.log("returning from fillSub", tempRoute)
    //     return tempRoute;

    // }

    // function assembleRoutes() {
    //     _.each($scope.routes2, function (route) {
    //         $scope.routes3.push(fillSubRoute(route));
    //         console.log("routes3", $scope.routes3)
    //     });
    //     console.log("AssembledRoutes", $scope.routes3);
    // }
    // $scope.routeBackup = [
    //     {
    //         "id": '',
    //         "title": "Tegaderm IV Advanced",
    //         "otherinfo": "This is other info",
    //         "nodes": [
    //             {
    //                 "id": 11,
    //                 "title": "Sterilize",
    //                 "nodes": [
    //                     {
    //                         "id": 111,
    //                         "title": "Rotory Convert",
    //                         "nodes": [
    //                             {
    //                                 "id": 1111,
    //                                 "title": "Slit Carrier Film",
    //                                 "nodes": []
    //                             },
    //                             {
    //                                 "id": 1112,
    //                                 "title": "Slit Laminate",
    //                                 "nodes": []
    //                             },
    //                             {
    //                                 "id": 1113,
    //                                 "title": "Slit Printed Liner",
    //                                 "nodes": []
    //                             },
    //                             {
    //                                 "id": 1114,
    //                                 "title": "Slit Cold Seal",
    //                                 "nodes": []
    //                             },
    //                         ]
    //                     }
    //                 ]
    //             },
    //             {
    //                 "id": 12,
    //                 "title": "node1.2",
    //                 "nodes": []
    //             }
    //         ]
    //     },
    //     {
    //         "id": 2,
    //         "title": "node2",
    //         "nodrop": true,
    //         "nodes": [
    //             {
    //                 "id": 21,
    //                 "title": "node2.1",
    //                 "nodes": []
    //             },
    //             {
    //                 "id": 22,
    //                 "title": "node2.2",
    //                 "nodes": []
    //             }
    //         ]
    //     },
    //     {
    //         "id": 3,
    //         "title": "node3",
    //         "nodes": [
    //             {
    //                 "id": 31,
    //                 "title": "node3.1",
    //                 "nodes": []
    //             }
    //         ]
    //     }
    // ];

    $scope.init = function () {
        console.log("ClientService", ClientService.models, ClientService.operations, ClientService.finishedGoodOutputs);
        $scope.models = angular.copy(ClientService.models);
        $scope.operations = angular.copy(ClientService.operations);
        $scope.timePeriods = angular.copy($scope.models.Periods);
        $scope.model = $scope.models[0];
        $scope.routes = angular.copy(ClientService.finishedGoodOutputs);
         $scope.loadOutputs($scope.model._id);

        console.log('Init routeController', $scope.operations);
        console.log('Init ', $scope.models);

    }();

}