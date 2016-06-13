define([
    'app'
],
function(app) {
    'use strict';
    console.log("loaded the licensed contractor controller");

    app.controller('licensedContractorController', ['$scope', '$rootScope', function($scope, $rootScope){
        console.log("activated the licensed contractor controller");
    }]);
});
