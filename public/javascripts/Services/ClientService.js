'use strict';
angular
    .module('vsapp')
    .factory('ClientService', ClientService);

ClientService.$inject = [];
function ClientService() {
  
    var service = {
       models : [],
       activeModel : {},
       operations : [],
       activeRoute : {},
       allItems : [],
       AOR : []
    };
    return service;
}
