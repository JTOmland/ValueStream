vsapp.controller('demandEditController', demandEditController)

demandEditController.$inject = ['$scope', '$mdDialog', 'dialogLocals', 'OperationService', 'BrokerService'];


function demandEditController($scope, $mdDialog, dialogLocals, OperationService, BrokerService) {

    //variables used to build scroller 
    $scope.selectedYear = 0;
    $scope.years = [];
    $scope.items = [];
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth();
    var previousYear = -1;
    var previousMonth = -1;



    $scope.originalItem = {};


    if (dialogLocals.mode) {
        $scope.mode = dialogLocals.mode
    }

    if (dialogLocals.periodStart) {
        console.log("has dialogLocals.periodStart", dialogLocals.periodStart)
        setUpDatePicker(dialogLocals.periodStart);
    }

    if (dialogLocals.product) {
        $scope.product = dialogLocals.product;
        $scope.originalItem = angular.copy(dialogLocals.product);
        //variables used for date picker and to change range of dates demand amount


    } else if (dialogLocals.workcenter) {
        $scope.workcenter = dialogLocals.workcenter;
        $scope.originalItem = angular.copy(dialogLocals.product);
        $scope.operation = dialogLocals.operation;
        console.log("editing modal has workcenter", $scope.workcenter);
    } else if (dialogLocals.operation) {
        $scope.operation = dialogLocals.operation;
        $scope.originalItem = angular.copy(dialogLocals.operation);
        console.log("editing modal has operation", $scope.operation);

    } else if (dialogLocals.model) {
        console.log("dialogLocals.model", dialogLocals.model)
        $scope.model = dialogLocals.model;
        $scope.originalItem = angular.copy(dialogLocals.model);
    }

    function setUpDatePicker(periodStart) {
        console.log('PeriodStart', periodStart);
        console.log("period type", typeof periodStart.getMonth());
        $scope.startDate = periodStart;
        $scope.trackingDate = angular.copy($scope.startDate);
        $scope.massChangeAmount = 0;
        $scope.endDate = angular.copy(periodStart);
        $scope.endDate.setMonth($scope.endDate.getMonth() + 59);
        $scope.periodStart = angular.copy(periodStart);
        $scope.periodEnd = angular.copy(periodStart);
        $scope.periodEnd.setMonth($scope.periodEnd.getMonth() + 59);
        for (var i = 0; i < 60; i++) {
            currentYear = $scope.trackingDate.getFullYear();
            currentMonth = $scope.trackingDate.getMonth();

            if (currentYear != previousYear) {
                $scope.years.push(currentYear);
                $scope.items.push({ year: currentYear, text: currentYear, header: true });
                previousYear = currentYear;
            }
            if (currentMonth != previousMonth) {
                var dateHolder = convertDate(currentYear, currentMonth)
                console.log('scroll builder month year date', currentMonth, currentYear, dateHolder)
                $scope.items.push({ year: currentYear, month: currentMonth, text: monthNames[currentMonth], header: false, date: dateHolder });
                previousMonth = currentMonth;
                $scope.trackingDate.setMonth($scope.trackingDate.getMonth() + 1, 1);
            }
        }

    }


    $scope.massCostChange = function () {
        var dateIndex = angular.copy($scope.startDate);
        while (dateIndex <= $scope.endDate) {
            $scope.workcenter.Cost[dateIndex.getTime()] = $scope.massChangeAmount;
            dateIndex.setMonth(dateIndex.getMonth() + 1);
        }

    }

    $scope.massDemandChange = function () {
        console.log('amount to mass change', $scope.massChangeAmount, "date range", $scope.startDate, $scope.endDate);
        var dateIndex = angular.copy($scope.startDate);
        while (dateIndex <= $scope.endDate) {
            $scope.product.Demand[dateIndex.getTime()] = $scope.massChangeAmount;
            dateIndex.setMonth(dateIndex.getMonth() + 1);
        }
    }

    // Whenever a different year is selected, scroll to that year
    $scope.$watch('selectedYear', angular.bind(this, function (yearIndex) {
        var scrollYear = Math.floor($scope.topIndex / 13);
        if (scrollYear !== yearIndex) {
            $scope.topIndex = yearIndex * 13;
        }
    }));
    // The selected year should follow the year that is at the top of the scroll container
    $scope.$watch('topIndex', angular.bind(this, function (topIndex) {
        var scrollYear = Math.floor(topIndex / 13);
        $scope.selectedYear = scrollYear;
    }));

    $scope.closeEdit = function () {

        $mdDialog.hide($scope.originalItem);
    }

    $scope.closeOperationEdit = function () {
        console.log("close operation edit original item", $scope.originalItem);
        $mdDialog.hide($scope.originalItem);
    }

    $scope.closeModelEdit = function () {

    }

    $scope.createModel = function () {
        console.log("createModel", $scope.model);
        OperationService.addModel($scope.model).then(function (data) {
            BrokerService.modelAdded(data);
            $mdDialog.hide(data)
        });

    }

    $scope.editModel = function () {

    }

    $scope.createOperation = function () {
        console.log('creatOperation button', $scope.operation);
        OperationService.updateOperation($scope.operation).then(function (data) {
            console.log("demand edit createOperaiton call to OperationsService returned with data", data);
            console.log('Calling BrokerService and sending $scope.operation')
            BrokerService.operationAdded($scope.operation);
            $mdDialog.hide(data);
        });

    }

    $scope.editOperation = function () {

    }

    $scope.createProduct = function () {
        $mdDialog.hide($scope.product);
    }

    $scope.editProduct = function () {
        // console.log("before dialogLocal.product", dialogLocals.product, $scope.product)
        // dialogLocals.product = angular.copy($scope.product)
        // console.log("after dialogLocal.product", dialogLocals.product, $scope.product)

        $mdDialog.hide($scope.product);
    }

    $scope.createWorkcenter = function () {
        //need to create a workcenter and then update the operation
        console.log('creatworkcenter button created workcenter and pushed into operation for update', $scope.operation);
        $scope.operation.WorkCenters.push($scope.workcenter)
        OperationService.updateWorkCenter($scope.workcenter).then(function (data) {
            BrokerService.workcenterAdded($scope.workcenter);
            $mdDialog.hide(data);
        });
    }

    $scope.editWorkcenter = function () {
        $mdDialog.hid($scope.workcenter);
    }

    if (!dialogLocals.mode == 'createModel') {
        //this builds the information used for the scroller years and months


    }


    function convertDate(year, month) {
        //item.month and item.year
        month++;
        var buildDateString = month;
        buildDateString += " 1, ";
        buildDateString += year;
        buildDateString += " 00:00:00";
        return new Date(buildDateString);
    }

};