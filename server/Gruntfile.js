//var isMac = require('os').type().indexOf('Darwin') !== -1;

var projectSrc = ['Gruntfile.js', 'server.js', 'utils/**/*.js', 'models/**/*.js', 'api-test/**/*.js'];
module.exports = function(grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);

    // load only required grunt tasks as tasks are run
    // help to skip these loadNpmTasks
    require('jit-grunt')(grunt, {
        mochacov: 'grunt-mocha-cov',
        jscs: 'grunt-jscs-checker'
    });

    grunt.initConfig({
        jshint: {
            all: {
                options: {
                    jshintrc: '../.jshintrc',
                    reporter: require('jshint-stylish')
                },
                src: projectSrc,
            }
        },
        jscs: {
            src: projectSrc,
            options: {
                config: '../.jscsrc',
                reporter: 'jscs-reporter.js'
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['api-test/*.js']
            }
        }
    });


    grunt.registerTask('test', ['jshint:all', 'mochaTest']);
    grunt.registerTask('build', ['jshint:all', 'jscs', 'mochaTest']);
    grunt.registerTask('default', ['build']);
};
