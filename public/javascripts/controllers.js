'use strict'

function controller1 ($scope){

    $scope.page = 'controller1';

}

function controller2 ($scope){

    $scope.page = 'controller2';

}

function controller3 ($scope) {
    console.log("controller3");
    $scope.page = "controller3";
}