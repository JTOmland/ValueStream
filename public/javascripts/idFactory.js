angular
    .module('vsapp')
    .factory('idFactory', idFactory);

idFactory.$inject = [];
function idFactory() {
    var service = {
        getID: getID,
        setLastID: setLastID
    };
    var lastID = 0;

    function getID(){
        lastID++;
        return lastID;
    }

    function setLastID(model){
        
        lastID = model.CPModelItems.LastID;
        console.log("setting lastID to", lastID);

    }
    
    return service;

}