requirejs.config({
    baseUrl: 'js',
    shim: {
        angular : {
            exports: 'angular'
        },
        'angularAnimate' : {
            deps: ['angular']
        },
        'angularResource' : {
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
        'angularResource': '../lib/angular-resource/angular-resource.min',
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
    'app',
    'publisher',
    'attributeSet',
    'licensedContractor'
], function() {
    angular.bootstrap(document, ['LicensedContractorApp']);
});
