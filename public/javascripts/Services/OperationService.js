angular
    .module('vsapp')
    .factory('OperationService', OperationService);

OperationService.$inject = ['$q', '$http', 'ClientService'];
function OperationService($q, $http, ClientService) {
    var service = {
        updateWorkCenter: updateWorkCenter,
        updateOperation: updateOperation,
        addModel: addModel,
        getModels: getModels,
        getOperations: getOperations,
        updateOutput: updateOutput,
        getOutput: getOutput,
        getFinishedGoodOutputs: getFinishedGoodOutputs
    };

    function updateOutput(output) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/api/output',
            data: output,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            console.log("succes http call for updateOutput data ", response);
            deferred.resolve(response);
        }, function errorCallback(response) {
            console.log("error on http call for updateOutput", response);
            deferred.reject(response);
           
        });

        return deferred.promise;

    }

    function getOperations(modelID) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/operations/' + modelID,
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            deferred.resolve(response);
            ClientService.operations = response.data;
            console.log("succes http call operations data ", response);
            deferred.resolve(response);
        }, function errorCallback(response) {
            console.log("error on http call operations data", response);
            deferred.reject(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        return deferred.promise;

    }

    function getOutput(outputID) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/outputs/' + outputID,
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            deferred.resolve(response);
            //ClientService.operations = response.data;
            console.log("succes http call operations data ", response.data);
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            console.log("error on http call operations data", response);
            deferred.reject(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        return deferred.promise;

    }

    function getFinishedGoodOutputs(ModelID) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/finishedGoodOuput/' + ModelID
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            deferred.resolve(response);
            //ClientService.operations = response.data;
            console.log("succes http call for all finished good outputs ", response.data);
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            console.log("error on http call for all finished good outputs", response);
            deferred.reject(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        return deferred.promise;

    }

    function getModels() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/model',
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            ClientService.models = response.data;
            console.log("succes http call models data ", response);
            deferred.resolve(response);
            
        }, function errorCallback(response) {
            console.log("error on http call models data", response);
            deferred.reject(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        return deferred.promise;

    }

    function addModel(model) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/api/model',
            data: model,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            deferred.resolve(response);
            console.log("succes http post model ", response);
            return response;
        }, function errorCallback(response) {
            console.log("error on http call for post model", response);
            deferred.reject(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        return deferred.promise;

    }

    function updateWorkCenter(workcenter) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/api/workcenter',
            data: workcenter,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            //resolving response will return the response from the server.  The server will
            //return the _id  (Mongoose ObjectId) of the workcenter created.
            console.log("succes http call for updateWorkcentr data ", response);
            deferred.resolve(response);
        }, function errorCallback(response) {
            console.log("error on http call for updateWorkcenter in factory", response);
            deferred.reject(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        return deferred.promise;
    }

    function updateOperation(operation) {
        console.log("operation to be updated", operation);
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/api/operations',
            data: operation,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            deferred.resolve(response);
            // console.log("succes http call update operation data ", response);
            // return response;
        }, function errorCallback(response) {
            console.log("error on http call for update operations data", response);
            deferred.reject(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        return deferred.promise;
    }



    return service;

}