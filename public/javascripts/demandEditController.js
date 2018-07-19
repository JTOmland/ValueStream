vsapp.controller('demandEditController', demandEditController)

demandEditController.$inject = ['$scope', '$mdDialog', 'dialogLocals'];


function demandEditController($scope, $mdDialog, dialogLocals) {

    //variables used to build scroller 
    $scope.selectedYear = 0;
    $scope.years = [];
    $scope.items = [];
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth();
    var previousYear = -1;
    var previousMonth = -1;
    $scope.startDate = dialogLocals.model.CPModelItems.PeriodStart;
    $scope.trackingDate = angular.copy($scope.startDate);

    //variables used for date picker and to change range of dates demand amount
    $scope.massChangeAmount = 0;
    $scope.endDate = angular.copy(dialogLocals.model.CPModelItems.PeriodStart);
    $scope.endDate.setMonth($scope.endDate.getMonth() + 59);
    $scope.periodStart = angular.copy(dialogLocals.model.CPModelItems.PeriodStart);
    $scope.periodEnd = angular.copy(dialogLocals.model.CPModelItems.PeriodStart);
    $scope.periodEnd.setMonth($scope.periodEnd.getMonth() + 59);
    
    $scope.product = dialogLocals.product;

    if (dialogLocals.mode) {
        $scope.mode = dialogLocals.mode
    }

    $scope.massDemandChange = function () {
        console.log('amount to mass change', $scope.massChangeAmount, "date range", $scope.startDate, $scope.endDate);
        var dateIndex = angular.copy($scope.startDate);
        while (dateIndex <= $scope.endDate) {
            $scope.product.Demand[dateIndex] = $scope.massChangeAmount;
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
   
    $scope.closeDemandEdit = function () {
        $mdDialog.hide();
    }

    $scope.createProduct = function () {
        console.log("new product", $scope.product);
        $mdDialog.hide($scope.product);
    }

    $scope.editProduct = function () {
        $mdDialog.hide($scope.product);
    }

     //this builds the information used for the scroller years and months
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
            $scope.trackingDate.setMonth($scope.trackingDate.getMonth() + 1);
        }
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