vsapp.controller('RouteDetailsController', RouteDetailsController)

RouteDetailsController.$inject = ['$scope', '$mdDialog', '$mdToast', '$rootScope', 'ClientService', 'OperationService', '$routeParams'];


function RouteDetailsController($scope, $mdDialog, $mdToast, $rootScope, ClientService, OperationService, $routeParams) {
    $scope.activeRoute = ClientService.activeRoute;
    $scope.status = "demand";



    //variables used to build scroller 
    $scope.selectedYear = 0;
    $scope.years = [];
    $scope.items = [];
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var currentYear; // = new Date().getFullYear();
    var currentMonth; // = new Date().getMonth();
    var previousYear = -1;
    var previousMonth = -1;

    console.log("This is the routeparams", $routeParams.id);
    console.log("this is the ativeRoute from clientservice", $scope.activeRoute);
    if ($scope.activeRoute.Demand[0]) {
        if($scope.activeRoute.Demand[0].period)
        setUpDatePicker($scope.activeRoute.Demand[0].period);
    }

    $scope.currentNavItem = 'page1';

    $scope.goto = function(page) {
      $scope.status = page;
    };


    function setUpDatePicker(periodStart) {
        $scope.startDate = new Date(periodStart);
        $scope.trackingDate = new Date(periodStart);
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
                var nextMonth = $scope.trackingDate.getMonth() + 1;
                $scope.trackingDate.setMonth(nextMonth, 1);

            }
        }

    }

    $scope.getKeys = function (ev, index) {
        console.log(ev, index);
        $scope.currentPeriod = index;
        $scope.enteredValue = ev.currentTarget.value
        console.log("scope.enteredValue = ", $scope.enteredValue, ev.currentTarget.value, ev.target.value)
        console.log("activeRoute", $scope.activeRoute);
    }

    function daysBetween(date1, date2) {
        var oneDay = 1000*60*60*24;
        var date1ms = date1.getTime();
        var date2ms = date2.getTime();
        var diff = date2ms - date1ms;
        return Math.round(diff/oneDay);
    }

    $scope.copyForward = function (periods, structure, attribute) {
        console.log("copyforward periods", periods, " currentPeriod ", $scope.currentPeriod)
        console.log('attribute', attribute, "structure", structure);
        console.log("scope.items", $scope.items);
        var startDate = $scope.items[$scope.currentPeriod].date
        var endDate = new Date();
        var indexDate = $scope.items[$scope.currentPeriod].date
        var index = $scope.currentPeriod;
        var doLoop = true;
        endDate.setMonth(startDate.getMonth() + periods, 1);
        console.log("start ", startDate, " end", endDate);
        console.log("index", (indexDate.getFullYear() + indexDate.getMonth()), "end",(endDate.getFullYear() + endDate.getMonth()) )
        if ($scope.currentPeriod) {
            while (doLoop) {
                console.log("index", indexDate, " end", endDate);
                switch (attribute) {
                    case "demand":
                        console.log("case is demand")
                        if (index < $scope.activeRoute.Demand.length) {
                            console.log("p is ", index, " and value is ", $scope.enteredValue)
                            $scope.activeRoute.Demand[index].amount = $scope.enteredValue;
                        };
                        break;
                    default:
                        console.log("case is default compare p to ", structure[index][attribute])
                        if (index < structure.length) {
                            console.log("p is ", index, " and value is ", $scope.enteredValue)
                            structure[index][attribute] = $scope.enteredValue;
                        };
                        break;
                }
                index++;
                if($scope.items[index].date){
                    indexDate = $scope.items[index].date
                    if(indexDate.getFullYear() == endDate.getFullYear()  && indexDate.getMonth() == endDate.getMonth()){
                        doLoop = false;
                    }
                }
               
                if(index > 100) break;

            }
        }
        console.log("structure", structure);
        console.log('this is active route after modification to structure', $scope.activeRoute); 

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


}