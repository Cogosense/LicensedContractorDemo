define([
    'app',
    'templates/attributeSetViewer'
],
function(app, Templates) {
    'use strict';
    console.log("loaded the viewer summary controller");

    app.factory('ApiAttributeService', ['$resource', function($resource) {
        return $resource('/publisher/:owner_id/attributes/:name');
    }]);

    var attributesMetaData = null;

    app.controller('viewerSummaryController', [
        '$scope',
        '$rootScope',
        '$injector',
        '$resource',
        '$uibModal',
        '$log',
        'popup',
        'uiGridConstants',
        'ApiAttributeService',
        function($scope, $rootScope, $injector, $resource, $uibModal, $log, popup, uiGridConstants, ApiAttributeService){
            console.log("activated the viewer summary controller");

            var Primary = null;

            var paginationOptions = {
                pageNumber: 1,
                pageSize: 25,
                sort: [],
                filter: {},
                select: []
            };

            var getPage = function() {
                var queryParams = paginationOptions.filter;

                queryParams.__limit = paginationOptions.pageSize;
                queryParams.__skip = paginationOptions.pageSize * (paginationOptions.pageNumber-1);

                var sort = '';
                var comma = '';

                for(var i = 0; i < paginationOptions.sort.length; ++i) {
                    var c = paginationOptions.sort[i];
                    switch(c.sort.direction) {
                        case uiGridConstants.ASC:
                            sort = sort + comma + c.field;
                            break;
                        case uiGridConstants.DESC:
                            sort = sort + comma + '-' + c.field;
                            break;
                        default:
                            break;
                    }
                    comma =',';
                }
                queryParams.__sort = sort;
                queryParams.__select = paginationOptions.select.join(',');

                Primary.query(queryParams, function success(data, headers){
                    var total = headers('X-total-count');
                    $scope.gridOptions.data = data;
                    $scope.gridOptions.totalItems = parseInt(total);
                }, function failure(response){
                    $log.info('Primary attribute set query failed with status: ' + response.status + 'data: ' + response.data);
                    popup.err('Primary Record Query Failed With Status ' + response.status, response.data);
                });
            };

            $scope.gridOptions = {
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                enableFiltering: true,
                gridMenuShowHideColumns: true,
                useExternalSorting: true,
                useExternalPagination: true,
                useExternalFiltering: true,
                onRegisterApi: function( gridApi ) {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.core.handleWindowResize();
                    $scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
                        paginationOptions.sort = sortColumns;
                        getPage();
                    });
                    $scope.gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        getPage();
                    });
                    $scope.gridApi.core.on.filterChanged( $scope, function() {
                        paginationOptions.filtering = false;
                        paginationOptions.filter={};
                        var grid = this.grid;
                        for(var i = 0; i < grid.columns.length; ++i) {
                            var col = grid.columns[i];
                            if(col.filters[0].term) {
                                paginationOptions.filtering = true;
                                paginationOptions.filter[col.field] = col.filters[0].term;
                            }
                        }
                        getPage();
                    });
                }
            };

            $scope.detailsGridRow = function(row) {
                console.log("detailsGridRow() click event received for row: " + JSON.stringify(row.entity));
                var modalInstance = $uibModal.open({
                    animation: true,
                    template: Templates.attributeSetViewer(attributesMetaData),
                    controller: 'viewerDetailsModalController',
                    resolve: {
                        data: function(){
                            return row.entity;
                        },
                        metadata: function(){
                            return attributesMetaData;
                        }
                    }
                });

                modalInstance.result.then(function(result){
                    console.log('viewerDetailsModal result: ' + JSON.stringify(result));
                    if(result.save){
                        var recName = attributesMetaData.ownerId.publisherName + ' ' + attributesMetaData.recordName;
                        Primary.update(row.entity, function success(data){
                            $log.info(recName + ' update success');
                        }, function failure(response){
                            $log.info(recName + ' update failed with status: ' + response.status + 'data: ' + response.data);
                            popup.err(recName + ' update Failed With Status ' + response.status, response.data);
                        });
                    }
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.$on('changePublisher', function(event, publisher_id) {
                console.log("changePublisher() event received");
                attributesMetaData = ApiAttributeService.get({publisher_id: publisher_id, owner_id: '575762eeb84836f47d31a57f', name: 'Bingo'}, function(data){
                    if(attributesMetaData.endPoint){
                        Primary = $injector.instantiate(['$resource', function($resource){
                            return $resource(attributesMetaData.endPoint, {id: '@_id'}, {
                                update: {
                                    method: 'PUT'
                                }
                            });
                        }]);
                        paginationOptions.select = [];
                        $scope.gridOptions.columnDefs = [];
                        for(var i = 0; i < attributesMetaData.attributes.length; ++i) {
                            var attr = attributesMetaData.attributes[i];
                            if(attr.summary){
                                $scope.gridOptions.columnDefs.push({
                                    enableHiding: false,
                                    field: attr.name,
                                    displayName: attr.label,
                                    enableFiltering: attr.searchable
                                });
                            }
                            /*
                             * The restrict attribute is enforced by the server
                             * when the Attribute Set is queried, based on
                             * current publisher id and Attribute Set owner id.
                             *
                             * Therefore this check is redundant, but it is left in
                             * in case the server is ever changed
                             */
                            if(!attr.restrict) {
                                paginationOptions.select.push(attr.name);
                            }
                        }
                        $scope.gridOptions.columnDefs.push({
                            name:'Details',
                            enableFiltering: false,
                            enableColumnMenu: false,
                            cellTemplate: '<div style="text-align:center"><button ng-click="grid.appScope.detailsGridRow(row)">Details</button></div>'
                        });
                    }
                });
            });
        }
    ]);
});
