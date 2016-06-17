define([
    'app',
    'templates/successModal',
    'templates/infoModal',
    'templates/warnModal',
    'templates/errorModal'
],
function(app, Templates) {
    'use strict';
    console.log("loaded the error modal service");

    app.factory('popup', ['$uibModal', function($uibModal){
        console.log("activated the modal service");

        function openModal(template) {
            return $uibModal.open({
                animation: true,
                template: template,
                controller: function($scope, $uibModalInstance) {
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'medium',
                backdrop: 'static'
            });
        }

        function ok(title, message) {
            return openModal(Templates.successModal({title: title, message: message}));
        }
        function info(title, message) {
            return openModal(Templates.infoModal({title: title, message: message}));
        }
        function warn(title, message) {
            return openModal(Templates.warnModal({title: title, message: message}));
        }
        function err(title, message) {
            return openModal(Templates.errorModal({title: title, message: message}));
        }

        return {
            ok : ok,
            info : info,
            warn : warn,
            err : err
        };
    }]);
});
