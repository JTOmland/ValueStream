vsapp.controller('productsController', productsController)

productsController.$inject = ['$scope', 'DataFactory', '$mdDialog'];


function productsController ($scope, DataFactory, $mdDialog) {

		$scope.product = {CFModelID: 151, SiteID: 0, SitenName:'', IsIncluded: true, RegionID: ''};

		$scope.addproduct = function(){
            console.log("product", $scope.product);
            _.each($scope.product, function(item){
                console.log(item);
            });
            if(!_.includes($scope.products, $scope.product)){
                $scope.products.push($scope.product);
            }
			
        }
        
        $scope.selectModel = function(model) {
            console.log("add code for selecgting a model")
            

        }

        $scope.editDemand = function(ev, model, product) {
            console.log("editDemand", product)
            if(!product.Demand) {
                product.Demand = [];
            }
            var items = {
                model: model,
                product: product,
            }

            $mdDialog.show({
                controller: 'demandEditController',
                templateUrl: '/partials/demandEdit',
                clickOutsideToClose: true,
                fullscreen: true,
                targetEvent: ev,
                dialogLocals: items
            }).then(function(newDemand) {
                console.log("demand edit dialog closed returning", newDemand);
                if(newDemand) {
                    product.Demand.push(newDemand);
                }
                //$scope.loadFacets(group);
            });
            console.log('adding demand')
        }

        $scope.editproduct= function(event,model, product) {
            console.log('add code to edit product ', event, model, product);
        }

        $scope.deleteproduct = function(event, model, product) {
            console.log('add code to delete product ', event, model, product);
        }

        $scope.addproduct = function(event, model) {
            console.log('add code to add product ', event, model);

        }

        $scope.editModel = function(event, model){
            console.log('add code to edit Model', event, model);

        }

        $scope.deleteModel = function($event, model) {
            console.log('add code to delete Model', event, model);

        }


        $scope.init = function(){
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