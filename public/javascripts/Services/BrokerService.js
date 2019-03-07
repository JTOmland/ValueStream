'use strict';
angular
    .module('vsapp')
    .factory('BrokerService', BrokerService);

BrokerService.$inject = ['$q', '$rootScope'];
function BrokerService($q, $rootScope) {
  
    var service = {
        openNewAction: function(){
            $rootScope.$broadcast('openNewAction');
        },
        modelAdded: function (model) {
            $rootScope.$broadcast('modelAdded', model);
        },
        modelRemoved: function (model) {
            $rootScope.$broadcast('modelRemoved', model);
        },
        changeModel: function (activeModel, models) {
            $rootScope.$broadcast('changeModel', activeModel, models);
        },
        operationAdded: function(operation) {
            console.log("BrokerService received call to notify operationsAdded for operation", operation);
            $rootScope.$broadcast('operationAdded', operation);
        },
        workcenterAdded: function(workcenter) {
            console.log("BrokerService received call to notify workcenterAdded for workcenter", workcenter);
            $rootScope.$broadcast('workcenterAdded', workcenter);
        },
        outputAdded: function(output) {
            console.log("brokerService received call to notify outputAdded for output", output);
        }

    };
    return service;
}
