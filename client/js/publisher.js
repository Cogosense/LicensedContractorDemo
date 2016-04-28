define([
    'app'
],
function(app) {
    'use strict';
    console.log("loaded the publisher");

    function PublisherModel(name){
        this.publisherName = name;
    }

    var publisherServices = angular.module('publisherServices', ['ngResource']);

    publisherServices.factory('Publisher', ['$resource', function($resource) {
        return $resource('/publisher/:id');
    }]);

    app.controller('publisherController', ['$scope', '$rootScope', 'Publisher', function($scope, $rootScope, Publisher){
        console.log("activated the publisher controller");
        $scope.publisherList = Publisher.query();

        $scope.createPublisher = function(){
            console.log("createPublisher() clicked");
            if($scope.newPublisherName) {
                var found = $scope.publisherList.filter(function(obj) {
                    return obj.publisherName === $scope.newPublisherName;
                });
                if (found.length === 0) {
                    var publisher = new Publisher();
                    publisher = new PublisherModel($scope.newPublisherName);
                    Publisher.save(publisher, function(publisher) {
                        $scope.publisherList.push(publisher);
                        $rootScope.currentPublisher = publisher;
                    });
                }
                $scope.newPublisherName = "";
            }
        };
        $scope.removePublisher = function(){
            console.log("removePublisher() clicked");
            for(var i = $scope.publisherList.length-1; i >= 0; --i){
                if ($scope.publisherList[i]._id === $rootScope.currentPublisher._id) {
                    Publisher.remove({ id: $scope.publisherList[i]._id });
                    $scope.publisherList.splice(i, 1);
                }
            }
            $rootScope.currentPublisher = { _id: "", publisherName: "No publisher" };
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
        console.log('removeAttribute called');
        return {
            restrict: 'C'
        };
    }]);
});
