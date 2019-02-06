"use strict"
vsapp.controller('routeController', routeController)

routeController.$inject = ['$scope', '$mdDialog', '$mdToast', '$rootScope', '$location', 'ClientService', 'OperationService'];


function routeController($scope, $mdDialog, $mdToast, $rootScope, $location, ClientService, OperationService) {
    var parent = {};
    var child = {};
    $scope.projects = ["A", "B", "C"];
    $scope.routes = [];
    $scope.indRoute = {};
    $scope.treeOptions = {

        dropped: function (event) {
            console.log("dropped", event);
            parent = event.dest.nodesScope.$nodeScope.$modelValue;
            child = event.source.nodeScope.$modelValue;
            _.each($scope.allItems, function(item){
                console.log('allItems before', item);
            });
            

            _.each(event.source.nodesScope.$modelValue, function (attr, index) {
                console.log("attr", attr)
                attr.order = index;
            });
            //$scope.allItems.push(event.nodesScope.$modelValue); 
            console.log("routes after drop", $scope.routes);
            console.log('all items after drop', $scope.allItems);
            
            finishedTreeDragandDrop();
        },

        beforeDrop: function (event) {
            console.log('before drop', event)
            var allowDrop = true


            // _.each(event.source.nodesScope.$modelValue, function (attr, index) {
            //     console.log("this is the attr and index", attr, index)
            //     if (!_.includes(event.dest.nodesScope.$modelValue, attr)) {
            //         allowDrop = false;
            //     };
            // });

            // if (!allowDrop) {
            //     // $scope.showDragAndDropError();
            // }
            console.log("allowDrop is ", allowDrop)

            return allowDrop;
        }
    };

    function finishedTreeDragandDrop () {
        //todo
        //given a bom of component has changed due to a drag and drop
        //need to save the parent and with this save the 
        //cache should be cleared
        //http call to all items again to include the updated component
        OperationService.updateComponent(parent).then(function(response){
            OperationService.getFinishedGoodOutputs
            $scope.allItems = angular.copy(ClientService.allItems);
        })
        
        console.log("parent and child", parent, child);
        $scope.openNumberPad(parent, child)
    }

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

    function openComponentAdd(mode, parent){
        console.log("openComponentAdd funciton fired")
        var processStep = {
            name:'',
            description:'',
            type:'',
            inputs: [],
            usages: []
        }
        var items = {
            operations: $scope.operations,
            parent: parent,
            processStep: processStep,
            mode: mode,
            periods: $scope.model.Periods
        }

        $mdDialog.show({
            controller: 'componentMakerController',
            templateUrl: '/maker',
            clickOutsideToClose: true,
            fullscreen: true,
            targetEvent: event,
            dialogLocals: items
        }).then(function (output) {
            console.log("return from dialog from newValueStream", output);
            if(output) {
                console.log("ouput returned from componentMaker dialog", output);
                $scope.loadOutputs();
                // OperationService.getOutput(output._id).then(function(response){
                //     console.log("called for outputID", output._id, "received", response);
                //     $scope.routes.push(response.data);
                // });
               
            } else {
                $scope.showSimpleToast("No component added!")
            }
        });

    }

    $scope.openNumberPad = function (parent, child) {
        console.log("openNumberpad fired")
        var processStep = {
            name:'',
            description:'',
            type:'',
            inputs: [],
            usages: []
        }
        var items = {
            parent: parent,
            child: child
        }

        $mdDialog.show({
            controller: 'numberPadController',
            templateUrl: '/numberPad',
            clickOutsideToClose: true,
            fullscreen: false,
            targetEvent: event,
            dialogLocals: items
        }).then(function (output) {
            console.log("return from dialog from numberpad", output);
            // if(output) {
            //     console.log("ouput returned from componentMaker dialog", output);
            //     $scope.loadOutputs();
            //     // OperationService.getOutput(output._id).then(function(response){
            //     //     console.log("called for outputID", output._id, "received", response);
            //     //     $scope.routes.push(response.data);
            //     // });
               
            // } else {
            //     $scope.showSimpleToast("No component added!")
            // }
        });

    }

    $scope.addStep = function (event, item) {
        console.log("adding step event and item", event, item);
        openComponentAdd('modify', item);
        //openDialog('create', item);
    }

    $scope.newValueStream = function () {
        console.log("newValueStreamButton pressed");
        // openDialog('create');
        openComponentAdd('create');

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

    $scope.hoverIn = function(item){
        console.log(item);
    }
    $scope.selectOperation = function (operation) {
        console.log("you selected", operation.SiteName)
    }

    $scope.loadOutputs = function (modelID) {
        OperationService.getFinishedGoodOutputs(modelID).then(function (response) {
            console.log("response from load outputs", response);
            $scope.routes = [];
            _.each(response.data, function (output) {
                if(output.BaseUsage){
                    $scope.routes.push(output._id);
                } else {
                    $scope.routes.push(output);
                }
            });
            console.log("$scope.routes after getFinishedGoodOutputs", $scope.routes);
           
        });

        
    }



    $scope.init = function () {
        console.log("ClientService models", ClientService.models)
        console.log("ClientService.operations", ClientService.operations)
        console.log("ClientService.finishedGoodOutputs", ClientService.finishedGoodOutputs);
        $scope.models = angular.copy(ClientService.models);
        $scope.operations = angular.copy(ClientService.operations);
        $scope.timePeriods = angular.copy($scope.models.Periods);
        $scope.model = $scope.models[0];
        $scope.routes = angular.copy(ClientService.finishedGoodOutputs);
        console.log('routes', $scope.routes);
        $scope.allItems = angular.copy(ClientService.allItems)
        console.log("allitems", $scope.allItems);
       // $scope.loadOutputs($scope.model._id);
        // console.log('Init routeController', $scope.operations);
        // console.log('Init ', $scope.models);
        // var component = {
        //     name: "Light Armour 2",
        //     description: "Light protective gear used primarily by the military",
        //     type: "Finished Good",
        //     inputs: ["5c37b4a22ab004e54fa12bdb"],
        //     usages: [{_id:"5c37b4a22ab004e54fa12bdb", amount: 40}],
        //     //_id: ""

        // }
        // OperationService.updateComponent(component).then(function(response){
        //     console.log("This is the response for updating/creating component", response);
        // });
   

    }();

}