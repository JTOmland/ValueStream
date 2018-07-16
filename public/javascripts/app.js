var vsapp = angular.module('vsapp', ['ngMaterial', 'ngMessages', 'ngRoute', 'mdDataTable', 'ui.tree', 'ngAnimate'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/partials/index',
                controller: controller3
            }).
            when('/demand', {
                templateUrl: 'partials/demand',
                controller: capacityController
            }).
            when('/status', {
                templateUrl: 'partials/status',
                controller: statusController
            }).
            when('/routes', {
                templateUrl: 'partials/routes',
                controller: routeController
            }).
            when('/operations', {
                templateUrl: 'partials/operations',
                controller: operationsController
            }).
            when('/workcenters', {
                templateUrl: 'partials/workcenters',
                controller: workcenterController
            }).
            when('/products', {
                templateUrl: 'partials/products',
                controller: productsController
            }).
            otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);
    }]).run(function ($rootScope) {
    });