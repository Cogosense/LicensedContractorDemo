define([
    'app'
],
function(app) {
    'use strict';
    console.log("loaded the attributes directives");

    function Attribute(){
        this.name = "Name";
    }

    app.controller('attributeController', ['$scope', function($scope){
        console.log("activated the attribute controller");
        $scope.newAttributeSetName = "";
        $scope.attributePickList = ["Planning", "Execution", "Closed"];
        $scope.selectedItem = "[not selected]";
        $scope.modelAttributes = [];
        $scope.addAttribute = function(){
            console.log("addAttribute() clicked");
            $scope.modelAttributes.push(new Attribute());
        };
        $scope.removeAttribute = function(){
            console.log("removeAttribute() clicked");
        };
    }]);
    app.directive('modelAttribute', [function() {
        console.log('modelAttribute called');
        return {
            restrict: 'A',
            template: function() { return "<p> Hello";}
        };
    }]);
    app.directive('removeAttribute', [function() {
        console.log('lcRemoveAttribute called');
        return {
            restrict: 'C'
        };
    }]);
});
