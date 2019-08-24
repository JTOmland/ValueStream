"use strict"
vsapp.controller('routeController', routeController)

routeController.$inject = ['$scope', '$mdDialog', '$mdToast', '$rootScope', '$location', 'ClientService', 'OperationService'];


function routeController($scope, $mdDialog, $mdToast, $rootScope, $location, ClientService, OperationService) {
    var parent = {};
    var child = {};
    var originalParent = {};
    var originalChild = {};
    $scope.projects = ["A", "B", "C"];
    $scope.routes = [];
    $scope.indRoute = {};
    $scope.treeOptions = {

        dropped: function (event) {
            console.log("dropped", event);
            parent = event.dest.nodesScope.$nodeScope.$modelValue;
            child = event.source.nodeScope.$modelValue;
            console.log("new parent", parent);
            _.each($scope.allItems, function (item) {
                console.log('allItems before', item);
            });
            var indexToRemove = originalParent.inputs.indexOf(originalChild);
            originalParent.inputs.splice(indexToRemove,0);


            _.each(event.source.nodesScope.$modelValue, function (attr, index) {
                console.log("attr", attr)
                attr.order = index;
            });
            //$scope.allItems.push(event.nodesScope.$modelValue); 
            console.log("routes after drop", $scope.routes);
            console.log('all items after drop', $scope.allItems);
            OperationService.updateComponent(parent).then(function (response) {
                OperationService.updateComponent(originalParent).then(function(response){
                    $scope.loadOutputs();
                });
                // OperationService.getAOR;
                // $scope.allItems = angular.copy(ClientService.allItems);
            });

            //finishedTreeDragandDrop();
        },

        beforeDrop: function (event) {
            console.log('before drop', event)
            var allowDrop = true;

            originalParent = event.source.nodesScope.$parent.$modelValue;
            originalChild = event.source.nodeScope.$modelValue;
            if(originalParent){
                console.log("original parent", originalParent);
                console.log("original chile", originalChild);

            }
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

    $scope.deleteComponent = function(item) {
        console.log("received deleteComponent", item);
        var confirm = $mdDialog.confirm()
            .title("Delete AOR")
            .textContent('Are you sure you would like to delete this area of responsibility?  Deleted items cannot be recovered.')
            .ariaLabel('Delete AOR')
            .ok('Delete')
            .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                console.log("returning from confirm would run delete", item);
                OperationService.deleteComponent(item).then(function (response) {
                    console.log("this is response from OperationService after delete", response);
                    $scope.loadOutputs();
                });
            }).catch(function(){
                //this catch is required because selecting cancel throws a possible unhandled exception.
                // see solution 2. https://github.com/angular/material/issues/10369

            });
    }

    function finishedTreeDragandDrop() {
        //todo
        //given a bom of component has changed due to a drag and drop
        //need to save the parent and with this save the 
        //cache should be cleared
        //http call to all items again to include the updated component
        OperationService.updateComponent(parent).then(function (response) {
            $scope.loadOutputs();
            // OperationService.getAOR;
            // $scope.allItems = angular.copy(ClientService.allItems);
        });

        console.log("parent and child", parent, child);
    };

    function openComponentAdd(mode, project, parent) {
        console.log("openComponentAdd funciton fired")
        if (!project) {
            var project = {
                name: '',
                description: '',
                type: '',
                inputs: [],
                usages: []
            }
        }

        var item = {}
        item.project = project;
        item.mode = mode;
        item.parent = parent;

        $mdDialog.show({
            controller: 'componentMakerController',
            templateUrl: '/maker',
            clickOutsideToClose: true,
            fullscreen: true,
            targetEvent: event,
            // focusOnOpen: false,
            dialogLocals: item
        }).then(function (output) {
            console.log("return from dialog from newValueStream", output);
            if (output) {
                console.log("ouput returned from componentMaker dialog", output);
                $scope.loadOutputs();
            } else {
                $scope.showSimpleToast("No component added!")
            }
        });

    };

    $scope.removeStep = function (scope, item) {
        console.log("removing step scope and item", scope, item);
        
        if(item.type != "AOR"){
            parent = scope.$parent.$parent.$parentNodesScope.$nodeScope.$modelValue;
            OperationService.updateComponent(parent).then(function (response) {
                $scope.loadOutputs();
            });
            scope.remove();
        } else {
            console.log("calling delete on item", item);
            $scope.deleteComponent(item);
        }
    };

    //edit an exisitng project
    $scope.editStep = function (event, project) {
        console.log("edit project ", project);
        openComponentAdd('edit', project);
    };
   
    //add a new sub project to existing project
    $scope.addStep = function (event, parent) {
        console.log("adding step event and item", parent);
        var project = undefined;
        openComponentAdd('modify', project, parent);
    };

    //add a new area of responsibility
    $scope.newAOR = function () {
        console.log("newValueStreamButton pressed");
        var parent = undefined;
        var project = undefined;
        // openDialog('create');
        openComponentAdd('create', project, parent);

    };

    $scope.loadOutputs = function (modelID) {
        console.log("loadoutputs")
        OperationService.getAOR(modelID).then(function (response) {
            console.log("response from load outputs", response);
            $scope.routes = [];
            _.each(response.data, function (output) {
                if (output.BaseUsage) {
                    $scope.routes.push(output._id);
                } else {
                    $scope.routes.push(output);
                }
            });
            console.log("$scope.routes after getAOR", $scope.routes);

        });
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

    $scope.init = function () {
        console.log("routeconroller init")
        $scope.loadOutputs()
        // console.log("ClientService models", ClientService.models)
        // console.log("ClientService.operations", ClientService.operations)
        // console.log("ClientService.AOR", ClientService.AOR);
        // $scope.models = angular.copy(ClientService.models);
        // $scope.operations = angular.copy(ClientService.operations);
        // $scope.timePeriods = angular.copy($scope.models.Periods);
        // $scope.model = $scope.models[0];
        // $scope.routes = angular.copy(ClientService.AOR);
        // console.log('routes', $scope.routes);
        // $scope.allItems = angular.copy(ClientService.allItems)
        // console.log("allitems", $scope.allItems);
    }();

    //stuff probably not needed
    $scope.openNumberPad = function (parent, child) {
        console.log("openNumberpad fired")
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
        });

    };

    function openDialog(mode, parent) {

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
            if (output) {
                $scope.loadOutputs(output.ModelID);
                // OperationService.getOutput(output._id).then(function(response){
                //     console.log("called for outputID", output._id, "received", response);
                //     $scope.routes.push(response.data);
                // });

            } else {
                $scope.showSimpleToast("No process step added!")
            }
        });

    };

}