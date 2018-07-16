vsapp.directive("alertMessages", function () {
    return {
        restrict: "E",  //The E means only recognize the directive when used as an element versus A as an attribute to a tag or class or comment.  So it could be AE if attribute and element both recognized. Or C for class, M for comment
        scope: {
            alert: '=',
            closeAlert: '&'
        },
        templateUrl: 'partials/alerts',

        link: function (scope, element) {

            scope.$watch(function(){return scope.alert.showMsg}, function(value) {
                console.log('watch scope.render value', value);
                console.log("directive watch fired", scope.alert)
                if(scope.alert.showMsg) {
                    scope.show = true;
                }
            }, true);
           
            scope.close = function() {
                scope.show = false;
                scope.closeAlert({ show: false });
            }
            console.log("setting showMsg to false;", scope.alert)

        }
    };
});