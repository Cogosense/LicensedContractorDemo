define([
    'app'
],
function(app) {
    'use strict';
    console.log("loaded the publisher controller");

    function PublisherModel(name){
        this.publisherName = name;
    }

    app.factory('PublisherService', ['$resource', function($resource) {
        return $resource('/publisher/:id');
    }]);

    app.controller('publisherController', ['$scope', '$rootScope', 'PublisherService', function($scope, $rootScope, PublisherService){
        console.log("activated the publisher controller");
        $scope.publisherList = PublisherService.query(function(){
            for(var i = 0 ; i < $scope.publisherList.length; ++i) {
                var publisher = $scope.publisherList[i];
                $rootScope.publisherLookup[publisher._id] = publisher;
            }
        });

        $scope.createPublisher = function(){
            console.log("createPublisher() clicked");
            if($scope.newPublisherName) {
                var found = $scope.publisherList.filter(function(obj) {
                    return obj.publisherName === $scope.newPublisherName;
                });
                if (found.length === 0) {
                    var publisher = new PublisherModel($scope.newPublisherName);
                    PublisherService.save(publisher, function(publisher) {
                        $scope.publisherList.push(publisher);
                        $rootScope.currentPublisher = publisher;
                        $rootScope.publisherLookup[publisher._id] = publisher;
                    });
                }
                $scope.newPublisherName = "";
            }
        };
        $scope.removePublisher = function(){
            console.log("removePublisher() clicked");
            for(var i = $scope.publisherList.length-1; i >= 0; --i){
                if ($scope.publisherList[i]._id === $rootScope.currentPublisher._id) {
                    PublisherService.remove({ id: $scope.publisherList[i]._id });
                    $scope.publisherList.splice(i, 1);
                    delete $rootScope.publisherLookup[$scope.publisherList[i]._id];
                }
            }
            $rootScope.currentPublisher = { _id: "", publisherName: "No publisher" };
        };
        $scope.changePublisher = function(){
            console.log("changePublisher() called");
            $rootScope.$broadcast('changePublisher', $rootScope.currentPublisher._id);
        };
    }]);
});
