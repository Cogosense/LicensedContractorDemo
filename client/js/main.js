requirejs.config({
    baseUrl: 'js',
    shim: {
        angular : {
            exports: 'angular'
        },
        'angularUiGrid' : {
            deps: ['angular']
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
        'angularUiGrid': '../lib/angular-ui-grid/ui-grid.min',
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
    'popup',
    'publisher',
    'attributeSetEditor',
    'viewerSummary',
    'viewerDetailsModal'
], function() {
    angular.bootstrap(document, ['LicensedContractorApp']);
});
