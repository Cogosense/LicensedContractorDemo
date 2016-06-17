'use strict()';
var path = require('path');
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        watch: {
            options: {
                nospawn: true
            },
            less: {
                files: ['client/styles/*.less'],
                tasks: ['less:server']
            },
            templates: {
                files: [ 'client/views/*.jade'],
                tasks: [ 'jade:dev']
            },
            jade: {
                files: ['node_modules/jade/runtime.js}'],
                tasks: ['copy:jade']
            },
            bootstrap: {
                files: ['node_modules/bootstrap/dist/css/bootstrap.min.css', 'node_modules/bootstrap/dist/fonts/*'],
                tasks: ['copy:bootstrap']
            },
            app: {
                files: ['client/{,*/}*.js'],
                tasks: ['copy:scripts']
            },
            resources: {
                files: ['client/favicon.ico', 'client/images/{,*/}*'],
                tasks: ['copy:resources']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    'server/views/*.jade',
                    'server/views/*.html',
                    'public/*.html',
                    'public/stylesheets/{,*/}*.css',
                    'public/js/{,*/}*.js',
                    'public/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            watch: {
                tasks: [ 'watch:less', 'watch:templates', 'watch:app', 'watch:resources', 'watch:livereload' ]
            }
        },
        connect: {
            options: {
                port: 3000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, 'public'),
                            lrSnippet
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        less: {
            server: {
                options: {
                    paths: ['client/lib/bootstrap/less', 'client/styles']
                },
                files: {
                    'public/stylesheets/bcsa.css': 'client/styles/bcsa.less'
                }
            }
        },
        jade: {
            dev: {
                options: {
                    amd: true,
                    pretty: true,
                    client: true,
                    namespace: 'Templates',
                    processName: function(filename){
                        return path.basename(filename, '.jade');
                    }
                },
                expand: true,
                cwd: 'client/views',
                src: [ '**/*.jade' ],
                dest: 'public/js/templates',
                ext: '.js'
            },
            production: {
                options: {
                    amd: true,
                    client: true,
                    namespace: 'Templates',
                    processName: function(filename){
                        return path.basename(filename, '.jade');
                    }
                },
                expand: true,
                cwd: 'client/views',
                src: [ '**/*.jade' ],
                dest: 'public/js/templates',
                ext: '.js'
            }
        },
        copy: {
            // During dev the scripts are just copied to the express doc root
            // and loaded individually by the browser for easy debugging
            scripts: {
                files: [
                    { expand: true, cwd: 'client/', src: [ 'js/**' ], dest: 'public/' },
                    { expand: true, cwd: 'client/', src: [ 'lib/**' ], dest: 'public/' }
                ]
            },
            resources: {
                files: [
                    { expand: true, cwd: 'client/', src: [ 'images/**' ], dest: 'public/' },
                    { expand: true, cwd: 'client/', src: [ 'favicon.ico' ], dest: 'public/' }
                ]
            },
            jade: {
                files: [
                    { expand: true, cwd: 'node_modules/jade/', src: 'runtime.js', dest: 'public/lib/jade/' }
                ]
            },
            bootstrap: {
                files: [
                    { expand: true, cwd: 'node_modules/bootstrap/dist/', src: ['fonts/**', 'css/**'], dest: 'public/lib/bootstrap/dist/' }
                ]
            }
        },
        clean: {
            build: [ 'public' ],
            release: [ 'public/js', 'public/lib/jade' ]
        },
        requirejs: {
            app: {
                options: {
                    baseUrl: "public/js",
                    mainConfigFile: "public/js/main.js",
                    out: "public/js/main.min.js",
                    optimize: 'uglify2',
                    inlineJSON: false,
                    name: "main"
                }
            }
        }
    });

    grunt.registerTask('dev', function (target) {

        grunt.task.run([
            'clean:build',
            'less:server',
            'jade:dev',
            'copy:scripts',
            'copy:resources',
            'copy:jade',
            'copy:bootstrap',
            'open',
            'concurrent:watch'
        ]);
    });

    grunt.registerTask('demo', function (target) {

        grunt.task.run([
            'clean:build',
            'less:server',
            'jade:production',
            'copy:scripts',
            'copy:resources',
            'copy:jade',
            'copy:bootstrap'
        ]);
    });

    grunt.registerTask('production', function (target) {

        grunt.task.run([
            'clean:build',
            'less:server',
            'jade:production',
            'copy:scripts',
            'copy:resources',
            'copy:jade',
            'copy:bootstrap',
            'requirejs:app',
            'clean:release'
        ]);
    });
};

