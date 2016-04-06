requirejs.config({
    baseUrl: 'js',
    shim: {
        angular : {
            exports: 'angular'
        },
        'angularAnimate' : {
            deps: ['angular']
        },
        'angularBootstrap' : {
            deps: ['angular', 'angularAnimate']
        }
    },
    paths: {
        /*
         * requirejs modules
         */
        json: '../lib/requirejs-plugins/src/json',
        text: '../lib/requirejs-plugins/lib/text',
        /*
         * bower modules
         */
        angular: '../lib/angular/angular',
        'angularAnimate': '../lib/angular-animate/angular-animate.min',
        'angularBootstrap': '../lib/angular-bootstrap/ui-bootstrap-tpls.min',
        /*
         * modules copied in by Grunt from node_modules
         */
        jade: '../lib/jade/runtime'
    }
});

/*
 * angular is loaded first
 */
require([
    'angular',
    'app'
], function(angular) {
    angular.bootstrap(document, ['LicensedContractor']);
});
