define([
    'angular',
    'angularUiGrid',
    'angularResource',
    'angularBootstrap'
],
function(angular) {
    'use strict';
    console.log("loading the LicensedContractor App");
    return angular.module('LicensedContractorApp', ['ui.bootstrap', 'ui.grid', 'ui.grid.pagination', 'ngResource']).run(function($rootScope){
        $rootScope.currentPublisher = { _id: "",  publisherName: "No Publisher"};
        $rootScope.publisherLookup = {};
    });
});
