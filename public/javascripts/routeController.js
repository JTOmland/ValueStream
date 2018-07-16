vsapp.controller('routeController', routeController)

routeController.$inject = ['$scope', '$http', '$mdDialog', '$mdToast', '$rootScope', 'DataFactory', 'SimulationService', 'BTSimulation', 'Simulation'];


function routeController($scope, $http, $mdDialog, $mdToast, $rootScope, DataFactory, SimulationService, BTSimulation, Simulation) {

    $scope.addStep = function(event, item) {
        console.log("adding step event and item", event, item);
        var items = {
            operations: $scope.operations,
            parent: item,
            processSteps: $scope.unorderedRoutes
        }

        $mdDialog.show({
            controller: 'RouteEditController',
            templateUrl: '/routeEditor',
            clickOutsideToClose: true,
            fullscreen: true,
            targetEvent: event,
            dialogLocals: items
        }).then(function(operation) {
            console.log("return from dialog operation returned", operation);
            if(operation) {
                var step = {};
                step.id = item.id * 10;
                step.title = operation.stepName;
                item.nodes.push(step);
                console.table(item)
            } else {
                $scope.showSimpleToast("No process step added!")
            }
            


        });
    };

    $scope.showSimpleToast = function(msg) {
        var pinTo = 'top right';
        $mdToast.show(
          $mdToast.simple()
            .textContent(msg)
            .position(pinTo)
            .hideDelay(3000)
        );
      };

    $scope.removeStep = function(event, item) {
        console.log("removing step event and item", event, item);
    };

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

    $scope.selectOperation = function (operation) {
        console.log("you selected", operation.SiteName)
    }

    $scope.testButton = function (event, item) {
        console.log("clicked item", item, event);
    }



    $scope.routes2 = [
        {
            "id": 1,
            "title": "Tegaderm IV Advanced 1624",
            "nodes": [11]
        }
    ]

    $scope.unorderedRoutes = [
        {
            "id": 11,
            "title": "Sterilize",
            "nodes": [111]
        },
        {
            "id": 111,
            "title": "Rotory Convert",
            "nodes": [111]
        },
        {
            "id": 1112,
            "title": "Slit Laminate",
            "nodes": []
        },
        {
            "id": 1113,
            "title": "Slit Printed Liner",
            "nodes": []
        },
        {
            "id": 1114,
            "title": "Slit Cold Seal",
            "nodes": []
        }
    ]

    $scope.routes3 = [];
    $scope.indRoute = {};

    function fillSubRoute(route){
        console.log("fillSubRoute route", route);
        var tempRoute = {};
        tempRoute.id = route.id;
        tempRoute.title = route.title;
        tempRoute.nodes = [];
        var workingRoute = {};
        while(route.nodes.length > 0) {
            var routeSubID = route.nodes.pop();
            console.log("rourteSubID", routeSubID)
            var uoRouteIndex = _.findIndex($scope.unorderedRoutes, function(o){
                return o.id == routeSubID
            });

            if(uoRouteIndex > -1) {
                console.log("uoroute", $scope.unorderedRoutes[uoRouteIndex])
                tempRoute.nodes.push($scope.unorderedRoutes[uoRouteIndex]);
                workingRoute = angular.copy($scope.unorderedRoutes[uoRouteIndex]);
                fillSubRoute(workingRoute);
            };

        }
        console.log("returning from fillSub", tempRoute)
        return tempRoute;

    }

    function assembleRoutes() {
        _.each($scope.routes2, function(route){
            $scope.routes3.push(fillSubRoute(route));
            console.log("routes3", $scope.routes3)
        });
        console.log("AssembledRoutes", $scope.routes3);
    }
    $scope.routes = [
        {
            "id": 1,
            "title": "Tegaderm IV Advanced",
            "nodes": [
                {
                    "id": 11,
                    "title": "Sterilize",
                    "nodes": [
                        {
                            "id": 111,
                            "title": "Rotory Convert",
                            "nodes": [
                                {
                                    "id": 1111,
                                    "title": "Slit Carrier Film",
                                    "nodes": []
                                },
                                {
                                    "id": 1112,
                                    "title": "Slit Laminate",
                                    "nodes": []
                                },
                                {
                                    "id": 1113,
                                    "title": "Slit Printed Liner",
                                    "nodes": []
                                },
                                {
                                    "id": 1114,
                                    "title": "Slit Cold Seal",
                                    "nodes": []
                                },
                            ]
                        }
                    ]
                },
                {
                    "id": 12,
                    "title": "node1.2",
                    "nodes": []
                }
            ]
        },
        {
            "id": 2,
            "title": "node2",
            "nodrop": true,
            "nodes": [
                {
                    "id": 21,
                    "title": "node2.1",
                    "nodes": []
                },
                {
                    "id": 22,
                    "title": "node2.2",
                    "nodes": []
                }
            ]
        },
        {
            "id": 3,
            "title": "node3",
            "nodes": [
                {
                    "id": 31,
                    "title": "node3.1",
                    "nodes": []
                }
            ]
        }
    ];

    $scope.init = function () {
        $scope.timePeriods = DataFactory.getTimePeriods();
        $scope.processModel = DataFactory.processModel();
        $scope.demandModel = DataFactory.demandModel();
        $scope.operations = DataFactory.siteModel();
        $scope.workCenterModel = DataFactory.workCenterModel();
        $scope.productModel = DataFactory.productModel();
        $scope.processSteps = DataFactory.processSteps();
        //assembleRoutes();
        console.log('Init routeController', $scope.operations);

    }();
};