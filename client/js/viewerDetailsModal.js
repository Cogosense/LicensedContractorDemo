define([
    'app'
],
function(app) {
    'use strict';
    console.log("loaded the viewer details modal controller");

    app.controller('viewerDetailsModalController', [
        '$scope',
        '$injector',
        '$log',
        '$uibModalInstance',
        'popup',
        'metadata',
        'data',
        function($scope, $injector, $log, $uibModalInstance, popup, metadata, data){
            console.log("activated the viewer details modal controller");

            var AdornmentModels = {};
            var adornmentMetaLookup = {};
            $scope.data = data;
            $scope.adornments = {};

            function getAdornmentResource(endPoint) {
                return $injector.instantiate(['$resource', function($resource){
                    return $resource(endPoint, {id: '@_id'}, {
                        update: {
                            method: 'PUT'
                        }
                    });
                }]);
            }

            function getAdornmentData(Adornment, adornment){
                var keyName = metadata.recordName + '_id';
                $scope.adornments[adornment._id] = {__create: true};
                $scope.adornments[adornment._id][keyName] = data._id;
                Adornment.get({id:$scope.data._id, __key: keyName}, function success(data){
                    console.log('received adornment data: ' + JSON.stringify(data));
                    $scope.adornments[adornment._id] = data;
                    $scope.adornments[adornment._id].__create = false;
                }, function failure(response, status){
                    if(response.status !== 404) {
                        popup.err('Query for ' + adornment.ownerId.publisherName + ' ' + adornment.recordName + ' Failed With Status ' + response.status, response.data);
                    }
                });
            }

            function saveAdornmentData(Adornment, adornment, data, create){
                var recName = adornment.ownerId.publisherName + ' ' + adornment.recordName;
                if(create){
                    console.log("creating adornment " + recName);
                    Adornment.save(data, function success (data, headers){
                        $log.info(recName + ' save succeeded');
                    }, function failure(response){
                        $log.info(recName + ' save failed with status: ' + response.status + 'data: ' + response.data);
                        popup.err(recName + ' save Failed With Status ' + response.status, response.data);
                    });
                } else {
                    console.log("updating  " + recName);
                    data.$update(function success (data, headers){
                        $log.info(recName + ' update succeeded');
                    }, function failure(response){
                        $log.info(recName + ' update failed with status: ' + response.status + 'data: ' + response.data);
                        popup.err(recName + ' update Failed With Status ' + response.status, response.data);
                    });
                }
            }

            for(var i = 0; i < metadata.adornments.length; ++i) {
                var adornment = metadata.adornments[i];
                if(adornment.endPoint){
                    var Adornment = getAdornmentResource(adornment.endPoint);
                    AdornmentModels[adornment._id] = Adornment;
                    adornmentMetaLookup[adornment._id] = adornment;
                    getAdornmentData(Adornment, adornment);
                }
            }

            $scope.ok = function () {
                var save = false;
                if($scope.primary.$dirty){
                    var recName = metadata.ownerId.publisherName + ' ' + metadata.recordName;
                    console.log('requesting parent to save ' + recName);
                    save = true;
                }
                for(var i = 0 ; i < metadata.adornments.length; ++i){
                    var adornment = metadata.adornments[i];
                    if($scope['adornment_' + adornment._id].$dirty){
                        saveAdornmentData(AdornmentModels[adornment._id], adornmentMetaLookup[adornment._id], $scope.adornments[adornment._id], $scope.adornments[adornment._id].__create);
                    }
                }
                $uibModalInstance.close({save: save});
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }
    ]);
});
