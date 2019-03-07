vsapp.controller('homeController', homeController)

homeController.$inject = ['$scope', 'OperationService', 'BrokerService'];


function homeController($scope, OperationService, BrokerService) {
    console.log("homecontroller")
    $scope.loadOperations = function (modelID) {

        OperationService.getOperations(modelID).then(function (response) {
            console.log("operations returned from loadOperations", response);
            $scope.operations = [];
            _.each(response.data, function (operation) {
                $scope.operations.push(operation);
            });
        });
    }

    $scope.newAction= function(){

        BrokerService.openNewAction();

    }

    $scope.loadOutputs = function (modelID) {
        OperationService.getAOR(modelID).then(function (response) {
            console.log("get all areas of responsibility respones", response)
            ClientService.AOR = angular.copy(response.data);
            console.log("clientservice AOR", ClientService.AOR)
        });
    }

    $scope.loadModels = function () {
        OperationService.getModels().then(function (response) {
            console.log("models returned on loadModels", response);
            $scope.models = [];
            if (response.data[0]) {
                _.each(response.data, function (model) {
                    // if(model.Periods.length >0) {
                    //     _.each(model.Periods, function(period){
                    //         console.log("period", period);
                    //     })
                    // }
                    $scope.models.push(model);
                    $scope.loadOperations(model._id)
                    $scope.loadOutputs(model._id);
                });
            } else {
                console.log("no models found")
            }

        });
    }

    $scope.getAllItems = function () {
        $scope.allItems = [];
        OperationService.getAllItems();
        // OperationService.getAllItems().then(function (response) {
        //     console.log("models returned on loadModels", response);
        //     if (response.data[0]) {
        //         _.each(response.data, function (item) {
        //             $scope.allItems.push(item);
        //         });
        //     } else {
        //         console.log("no items found")
        //     }

        // });
    };

    $scope.init = function () {
        console.log("Init homeController followed by add product call")
        // OperationService.addProduct().then(function(resp){
        //     console.log("respons from add product", resp)
        // })


        $scope.loadModels();
        $scope.getAllItems();
    }();
};