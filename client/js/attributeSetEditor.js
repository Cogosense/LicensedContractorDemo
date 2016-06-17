define([
    'app',
    'templates/attributeEditor',
    'templates/adornmentEditor'
],
function(app, Templates) {
    'use strict';
    console.log("loaded the attribute set controller");

    var datatypes = [
        '-- Built-in types',
        'date',
        'enum',
        'key',
        'text'
    ];

    function AttributeSetModel(name, owner){
        this.recordName = name;
        this.ownerId = owner;
        this.endPoint = "";
        this.attributes = [];
    }

    function AttributeModel(){
        this.label = "";
        this.desc = "";
        this.name = "";
        this.type = "";
        this.restrict = false;
        this.summary = false;
        this.searchable = false;
    }

    app.factory('AttributeSetService', ['$resource', function($resource) {
        return $resource('/attributeSet/:id', { id: '@_id'}, {
            update: {
                method: 'PUT'
            }
        });
    }]);

    app.controller('attributeSetEditorController', ['$scope', '$rootScope', '$filter', 'popup', 'AttributeSetService', function($scope, $rootScope, $filter, popup, AttributeSetService){
        console.log("activated the attribute set controller");
        $scope.dataTypes = angular.copy(datatypes);
        $scope.attributeSetList = AttributeSetService.query();
        $scope.currentPublisherRecordList = [];
        $scope.currentSelectedAdornments = {};
        $scope.currentAttributeSet = null;

        function setCurrentSelectedAdornments(){
            $scope.currentSelectedAdornments = {};
            if($scope.currentAttributeSet){
                for(var i = 0; i < $scope.currentAttributeSet.adornments.length; ++i) {
                    $scope.currentSelectedAdornments[$scope.currentAttributeSet.adornments[i]] = true;
                }
            }
        }

        function setCurrentDataTypeList(){
            $scope.dataTypes = angular.copy(datatypes);
            if($scope.currentPublisherRecordList.length) {
                $scope.dataTypes.push('-- Publisher defined types');
                for(var i = 0; i < $scope.currentPublisherRecordList.length; ++i) {
                    $scope.dataTypes.push($scope.currentPublisherRecordList[i].recordName);
                }
            }
        }

        function setCurrentPublisherRecordList(){
            $scope.currentPublisherRecordList = [];
            if($scope.attributeSetList.length) {
                for(var i = 0; i < $scope.attributeSetList.length; ++i) {
                    if($scope.attributeSetList[i].ownerId == $rootScope.currentPublisher._id) {
                        $scope.currentPublisherRecordList.push($scope.attributeSetList[i]);
                    }
                }
            }
            setCurrentDataTypeList();
        }

        $scope.createAttributeSet = function(){
            console.log("createAttributeSet() clicked");
            if($scope.newAttributeSetName) {
                var found = $scope.attributeSetList.filter(function(obj) {
                    return obj.recordName === $scope.newAttributeSetName && obj.ownerId === $rootScope.currentPublisher._id;
                });
                if (found.length === 0 && $rootScope.currentPublisher._id) {
                    var attributeSet = new AttributeSetModel($scope.newAttributeSetName, $rootScope.currentPublisher._id);
                    AttributeSetService.save(attributeSet, function(attributeSet) {
                        attributeSet.attributes.push(new AttributeModel());
                        $scope.attributeSetList.push(attributeSet);
                        $scope.currentAttributeSet = attributeSet;
                        setCurrentPublisherRecordList();
                        setCurrentSelectedAdornments();
                    });
                }
                $scope.newAttributeSetName = "";
            }
        };
        $scope.removeAttributeSet = function(){
            console.log("removeAttributeSet() clicked");
            for(var i = $scope.attributeSetList.length-1; i >= 0; --i){
                if ($scope.attributeSetList[i]._id === $scope.currentAttributeSet._id) {
                    AttributeSetService.remove({ id: $scope.attributeSetList[i]._id });
                    $scope.attributeSetList.splice(i, 1);
                }
            }
            $scope.currentAttributeSet = null;
        };
        $scope.changeAttributeSet = function(oldValue){
            console.log("changeAttributeSet() clicked");
            if(oldValue && oldValue._id) {
                oldValue.$update();
            }
            if($scope.currentAttributeSet.attributes.length === 0) {
                $scope.currentAttributeSet.attributes.push(new AttributeModel());
            }
            setCurrentPublisherRecordList();
            setCurrentSelectedAdornments();
        };

        $scope.$on('changePublisher', function(event) {
            console.log("changePublisher() event received");
            setCurrentPublisherRecordList();
            setCurrentSelectedAdornments();
        });

        $scope.addAttributeBefore = function(index){
            console.log("addAttributeBefore() clicked on item " + index);
            $scope.currentAttributeSet.attributes.splice(index, 0, new AttributeModel());
        };
        $scope.addAttributeAfter = function(index){
            console.log("addAttributeAfter() clicked on item " + index);
            $scope.currentAttributeSet.attributes.splice(index + 1, 0, new AttributeModel());
        };
        $scope.removeAttribute = function(index){
            console.log("removeAttribute() clicked on item " + index);
            $scope.currentAttributeSet.attributes.splice(index, 1);
        };

        $scope.changeDataTypeRef = function(index){
            console.log("changeDataTypeRef() item changed " + index);
            $scope.currentAttributeSet.attributes[index].typeIsSet = false;
            for(var i = 0; i < $scope.currentPublisherRecordList.length; ++i) {
                if($scope.currentPublisherRecordList[i].recordName === $scope.currentAttributeSet.attributes[index].type) {
                    $scope.currentAttributeSet.attributes[index].typeRef = $scope.currentPublisherRecordList[i]._id;
                    $scope.currentAttributeSet.attributes[index].typeIsSet = true;
                }
            }
        };

        $scope.changeAdornment = function(adornmentId){
            console.log("changeAdornment() adornment " + adornmentId);
            var keyFound = false;
            var keyTypeCorrect = false;
            if($scope.currentSelectedAdornments[adornmentId]) {
                var adornment = $filter('filter')($scope.currentPublisherRecordList, {_id: adornmentId})[0];
                var attrLen = adornment.attributes ? adornment.attributes.length : 0;
                for(var i = 0 ; i < attrLen; ++i){
                    var attr = adornment.attributes[i];
                    if(attr.name === $scope.currentAttributeSet.recordName + '_id'){
                        keyFound = true;
                        if(attr.type === 'key'){
                            keyTypeCorrect = true;
                        }
                        break;
                    }
                }
                if(!keyFound){
                    popup.err('Missing Association key',
                              'The key ' +
                                  $scope.currentAttributeSet.recordName +
                                  '_id must be defined in the record ' +
                                  adornment.recordName +
                                  '.'
                             );
                    delete $scope.currentSelectedAdornments[adornmentId];
                    return;
                }
                if(!keyTypeCorrect){
                    popup.err('Incorrect Type for Association Key',
                              'The attribute ' +
                                  $scope.currentAttributeSet.recordName +
                                  '_id in the record ' +
                                  adornment.recordName +
                                  ' must have the type <b>key</b>.'
                             );
                    delete $scope.currentSelectedAdornments[adornmentId];
                    return;
                }
                $scope.currentAttributeSet.adornments.push(adornmentId);
            } else {
                for(var j = 0; j < $scope.currentAttributeSet.adornments.length; ++j) {
                    if($scope.currentAttributeSet.adornments[j] === adornmentId) {
                        $scope.currentAttributeSet.adornments.splice(j, 1);
                    }
                }
            }
        };
    }]);

    app.directive('modelAttribute', [function() {
        console.log('modelAttribute called');
        return {
            restrict: 'A',
            template: Templates.attributeEditor()
        };
    }]);

    app.directive('modelAdornment', [function() {
        console.log('modelAdornment called');
        return {
            restrict: 'A',
            template: Templates.adornmentEditor()
        };
    }]);
});
