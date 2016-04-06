define([
    'angular',
    'angularBootstrap'
],
function(angular) {
    'use strict';
    console.log("loading the LicensedContractor App");
    return angular.module('LicensedContractor', ['ui.bootstrap'])
    .controller( 'LicensedContractorAttributes', ['$scope', function($scope) {
        console.log("activated the main controller");
        $scope.attributePickList = ["Planning", "Execution", "Closed"];
        $scope.selectedItem = "[not selected]";
    }]);
});
