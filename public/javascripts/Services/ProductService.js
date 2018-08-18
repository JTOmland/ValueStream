angular
    .module('vsapp')
    .factory('ProductService', ProductService);

ProductService.$inject = ['DataFactory'];
function ProductService(DataFactory) {
    var service = {
        addProduct: addProduct,
        editProduct: editProduct
    };

    function addProduct(product){
        operation.WorkCenters.push(workcenter);
        //var index = _.findIndex(DataFactory.SiteModel(), function(o) { return o.SiteID == operation.SiteID; }); 
    }

    function editProduct(product) {
        
    }

   
    
    return service;

}