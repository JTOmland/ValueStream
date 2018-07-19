vsapp.controller('productsController', productsController)

productsController.$inject = ['$scope', 'DataFactory', '$mdDialog'];


function productsController($scope, DataFactory, $mdDialog) {


    $scope.product = { CFModelID: 151, SiteID: 0, SitenName: '', IsIncluded: true, RegionID: '' };
    function buildDemand(product) {
        var trackingDate = angular.copy($scope.model.CPModelItems.PeriodStart)
        for(var i=0; i<60; i++) {
            product.Demand[trackingDate] = 0;
            trackingDate.setMonth(trackingDate.getMonth() + 1);
        }
    }

    $scope.addProducts = function() {
        console.log('add products')
        var product = {
            ProductName: '',
            ProductDescription: '',
            ProductFamily: '',
            ProductInternalID: '',
            SellingPrice: '',
            Currency: '',
            UOM: '',
            Demand: {}, //{date: amount, date2: amount
            Route: []
        }
        buildDemand(product);
        console.log("new proudct demand", product.Demand)
        var items = {
            model: $scope.model,
            product: product,
            mode: 'create'

        }

        $mdDialog.show({
            controller: 'demandEditController',
            templateUrl: '/partials/demandEdit',
            clickOutsideToClose: true,
            fullscreen: true,
            dialogLocals: items,
        }).then(function(productUpdate){
            console.log("returned from dialog and product is ", productUpdate)
        });
    }

    $scope.selectModel = function (model) {
        console.log("add code for selecgting a model")


    }

    $scope.editDemand = function (ev, model, product) {
        console.log("editDemand", product)
        if (!product.Demand) {
            product.Demand = [];
        }
        var items = {
            model: $scope.model,
            product: product,
        }

        $mdDialog.show({
            controller: 'demandEditController',
            templateUrl: '/partials/demandEdit',
            clickOutsideToClose: true,
            fullscreen: true,
            targetEvent: ev,
            dialogLocals: items
        }).then(function (newDemand) {
            console.log("demand edit dialog closed returning", newDemand);
            // if(newDemand) {
            //     product.Demand.push(newDemand);
            // }
            //$scope.loadFacets(group);
        });
        console.log('adding demand')
    }

    $scope.editproduct = function (event, model, product) {
        console.log('add code to edit product ', event, model, product);
    }

    $scope.deleteproduct = function (event, model, product) {
        console.log('add code to delete product ', event, model, product);
    }


    $scope.editModel = function (event, model) {
        console.log('add code to edit Model', event, model);

    }

    $scope.deleteModel = function ($event, model) {
        console.log('add code to delete Model', event, model);

    }


    $scope.init = function () {
        $scope.timePeriods = DataFactory.getTimePeriods();
        $scope.processModel = DataFactory.processModel();
        $scope.demandModel = DataFactory.demandModel();
        $scope.operations = DataFactory.siteModel();
        $scope.workCenterModel = DataFactory.workCenterModel();
        $scope.productModel = DataFactory.productModel();
        $scope.models = [];
        $scope.model = DataFactory.fullModel();
        $scope.models.push($scope.model);
        console.log("Model", $scope.model)
    }();
};