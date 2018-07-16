vsapp.controller('statusController', statusController)

statusController.$inject = ['$scope','$http', '$mdDialog','$mdToast','$rootScope', 'DataFactory', 'SimulationService','BTSimulation','Simulation'];


function statusController ($scope, $http, $mdDialog, $mdToast, $rootScope, DataFactory, SimulationService, BTSimulation, Simulation) {

   
    $scope.processSteps = [];
    $scope.products = [];
    $scope.inventory = {};
    $scope.inventory2 = {}; //temp for string inventory names
    var monthsInventoryFactor = 1;

    $scope.testRandom = function(){
        Simulation.runSimulation($scope.inventory);
    }

    $scope.saveData = function(){
        //console.log("capacityController saveData and data is", angular.toJson(DataFactory.fullModel()));
        $http({
            method: 'POST',
            url: 'api/save',
            data: angular.toJson(DataFactory.fullModel()),
            headers: {
                'Content-Type': 'application/json',
                'calledFrom': 'admin'
            }
        }).success(function(data, status) {
        }).error(function(data, status){
        });
    }
    
   
   // $scope.hopper = [];
    // $scope.operation;
    //$scope.operationDemand=[];  //{coating: {product: [{period:demand}]}}
    //$scope.operations = {"coating":{"product":{}},"Micro-replication":{"product":{}},"PET Film Making":{"product":{}},"Converting":{"product":{}}}

		function createKeyVariableTable(){
			//make a object
			//keyVariableTables = [{Operation:coating},{tableName;test1},[{workcenter:[{period:value}]]},
		}

        $scope.runSimulation = function() {
           // console.log("capacityController calling runsimulation process model", DataFactory.processModel());
           // SimulationService.runSimulation($scope.inventory);
		   
        }

		$scope.filteredDemand = function(items, filter) {
			if(!filter){
				//console.log("returning items");
				return items;
			}

			//console.log("filteredDemand", items, filter);
		    var result = {};
		    angular.forEach(items, function(value, key) {
		    	//console.log("in foreach", value, key);
		    	//the key is in periodID and filter is in duedate format so get period
		    	convertedkey = $scope.getPeriod(key);
		    //	console.log("changed key to duedate", key);
		        if (convertedkey == filter) {
		            result[key] = value;
		           // console.log("result", result);
		        }
		    });
		    
		    return result;
		}

		$scope.getPeriod = function(period) {

			var periodName = _.find($scope.demandModel, function(num){ return num.PeriodID == period; });
			return periodName.DueDate;
		}

		$scope.selectedTimePeriod = function(){

		}

		function createProductList() {
			//console.log("In createproductlist");
			_.each($scope.productModel, function(product) {
				if(!_.contains($scope.products, product.ProductName)){
					//console.log("pushing to producs", product.ProductName);
					$scope.products.push(product.ProductName);
				}
			})
		}

		function addDemandToOperation(process) {
			//find Site in sitemodel and add a structure {productName:{{period:amount},{period:amount}}
			var siteMatch = _.find($scope.siteModel, function(site){
				return process.SiteName == site.SiteName;
			})
			if(!siteMatch.products){
				siteMatch.products = {};
			}
			if(!siteMatch.products[process.ProductName]){
				siteMatch.products[process.ProductName] = {};
			}
			var currentDemand = siteMatch.products[process.ProductName];
           
			_.each(process.processAllDemand, function(lastProcessDemand, lastProcessPeriod) {
				if(process.ProductName == "ASOC3") {
						//console.log("adding demand in operation for ASOC", process);
				}
				if(currentDemand[lastProcessPeriod]){
					currentDemand[lastProcessPeriod] += lastProcessDemand;
				} else {
					currentDemand[lastProcessPeriod] = lastProcessDemand;
				}
			})
			if(process.ProductName == "ASOC3") {
				// console.log("ending demand ", currentDemand);
			}
			//console.log("addDemand", siteMatch);
		}

		function test(){
			var obj = JSON.parse(localStorage.getItem('myStorage'));
			return obj;
		}


		//period product demand
		$scope.calculateDemands = function(){
			
			var processAllDemand = {};
			var operation = {};
           
			//temp fill out product list on propDemand need to change propdemand to things to do at init
			createProductList();
			//console.log("products", $scope.products.length);
			_.each($scope.productModel, function(product){
				var lastProcess = {};
				console.log("next product", product);
				//Find process that haas "none" for nextprocess which means it is the final process step
				for (var i = 0; i<$scope.processModel.length; i++) {
                    
					if($scope.processModel[i].ProductName == product.ProductName && $scope.processModel[i].NextProcessStepName == "None"){
						console.log("lastProcess match", $scope.processModel[i], "for product", product);
						$scope.processSteps.push($scope.processModel[i]);
						lastProcess = $scope.processModel[i];
						for(var j=0; j<$scope.demandModel.length; j++){
							if($scope.demandModel[j].ProductName ==product.ProductName){
								processAllDemand[$scope.demandModel[j].PeriodID] = Number($scope.demandModel[j].Quantity);
							}
						}
						lastProcess.processAllDemand = processAllDemand;
						addDemandToOperation(lastProcess);
						//addDemandToOperation(process)
						//$scope.demandByOperation.push(operation);
						processAllDemand = {};
						break;
					}
				}

				if(lastProcess) {
					var evaluated = [];
					var stack = [];
					stack.push(lastProcess);
					evaluated.push(lastProcess);
					console.log("calling next product", lastProcess.ProductName);
					propogateRootDemand(evaluated, stack, lastProcess.ProductName);
					console.log("returned from call to recursive");
				}
				 

				
			})
		}

		function addDemand(parentProcess, childProcess){
            var totalDemand = 0;
            var numPeriods = 0;
            var outputCode = childProcess.SiteID.toString() + childProcess.ProductID.toString();
            var stringCode = childProcess.SiteName + "_" + childProcess.ProductName;

			_.each(parentProcess.processAllDemand, function(parentDemand, parentPeriod) {
				// if(lastProcess.ProductName == "ASOC3") {
				// 	console.log("demand",nextProcessDemand, nextProcessDemand/processToPropogate.UnitCost, lastProcess.UnitTime/100, nextProcessDemand/processToPropogate.UnitCost * lastProcess.UnitTime/100);
				// 	console.log("lastProcess yield", lastProcess.UnitTime);
				// }
               
				if(childProcess.processAllDemand[parentPeriod]){
					childProcess.processAllDemand[parentPeriod] += parentDemand/parentProcess.UnitCost * childProcess.UnitTime/100;
                    totalDemand += parentDemand/parentProcess.UnitCost * childProcess.UnitTime/100;
                    numPeriods++;
                    
                } else {
                    childProcess.processAllDemand[parentPeriod] = parentDemand/parentProcess.UnitCost * childProcess.UnitTime/100;
                    totalDemand += parentDemand/parentProcess.UnitCost * childProcess.UnitTime/100;
                    numPeriods++;
                }
			});

            if($scope.inventory[outputCode]){
                $scope.inventory[outputCode] += totalDemand/numPeriods * monthsInventoryFactor;
                $scope.inventory2[stringCode] += totalDemand/numPeriods * monthsInventoryFactor;
            } else {
                $scope.inventory[outputCode] = totalDemand/numPeriods * monthsInventoryFactor;
                $scope.inventory2[stringCode] = totalDemand/numPeriods * monthsInventoryFactor;
            }
		}


		function propogateRootDemand (evaluated, stack, product) {

			if(stack.length == 0){
				return false;
			} else {
				var lastProcess = stack.shift();
				var processDemand = {};
				if(!lastProcess.processAllDemand){
					lastProcess.processAllDemand = {};
				}
				//find children of lastProcess
				_.each($scope.processModel, function(process){
					if(process.NextProcessStepName == lastProcess.ProcessStepName && process.ProductName == lastProcess.ProductName && process.UnitTime !="0"){  //
						stack.push(process);
                        //console.log("process and last process", process, lastProcess)
                        //here add to lastProcess that one child is this process
                        //thus keep track of inputs to process using processID
                        //each unique process step for each product has processID
                        //so input will be list of these processID
                        //and outuputs for each process step will be it's processID
                        if(!lastProcess.inputs){
                            lastProcess.inputs = [];
                        }
                        outputCode = process.SiteID.toString() + process.ProductID.toString();
                        if(!_.contains(lastProcess.inputs, outputCode)){
                            lastProcess.inputs.push(outputCode);
                           // console.log("Adding inputs", lastProcess);
                        }
                        
					}
				})
				//evaluate lastProcess if it has not already been evaluated
				if(!_.contains(evaluated, lastProcess)){
					//since the parents have been evaluated only need to check parents for match to get demand
					_.each(evaluated, function(processToPropogate) {
						if(processToPropogate.ProcessStepName == lastProcess.NextProcessStepName && lastProcess.ProductName == processToPropogate.ProductName && processToPropogate.UnitTime !="0"){
							addDemand(processToPropogate, lastProcess);
						}
							//console.log("demand added");
					})
					evaluated.push(lastProcess);
					$scope.processSteps.push(lastProcess);
					addDemandToOperation(lastProcess);
				}
				
				propogateRootDemand(evaluated, stack, lastProcess.ProductName);
				//console.log("return from call stack", stack.length);
                //console.log("return from call stack process model", $scope.processModel);
			}
		}

        $scope.init = function(){
            $scope.timePeriods = DataFactory.getTimePeriods();
            $scope.processModel = DataFactory.processModel();
            $scope.demandModel = DataFactory.demandModel();
            $scope.siteModel = DataFactory.siteModel();
            $scope.workCenterModel = DataFactory.workCenterModel();
            $scope.productModel = DataFactory.productModel();
                
        }();
	};