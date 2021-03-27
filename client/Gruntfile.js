module.exports = function(grunt) {

    var stringify = require('stringify');
    // show elapsed time at the end
    require('time-grunt')(grunt);
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    var config = {
        dist: './dist'
    };

    grunt.initConfig({
        dclConfig: config,
        jshint: {
            all: {
                options: {
                    jshintrc: '../.jshintrc',
                    reporter: require('jshint-stylish')
                },
                src: ['js/**/*.js', 'admin/**/*.js', 'login/**/*.js', 'general/**/*.js', 'resources/**/*.js', 'common/**/*.js']
            }
        },
        jscs: {
            src: ['js/**/*.js', 'admin/**/*.js', 'login/**/*.js', 'general/**/*.js','resources/**/*.js', 'common/**/*.js'],
            options: {
                config: '../.jscsrc'//,
                //reporter: 'jscs-reporter.js'
            }
        },
        watch: {
            dist: {
                files: [
                        'Gruntfile.js','js/**/*.js','common/**/*.js','resources/**/*.js',
                        'admin/**/*.js', 'admin/**/*.html',
                        'login/**/*.js', 'login/**/*.html',
                        'general/**/*.js', 'general/**/*.html', 'common/**/*.js',
                        'partials/*.html', 'index.html', 'css/**/*.css', 'css/**/*.scss'],
                tasks: ['buildDev']
            }
        },
        browserify: {
            options: {
                transform: [stringify(['.html', '.xml'])],
                allowErrors: false,
                browserifyOptions: {
                    debug: true
                }
            },
            dist: {
                transform: [stringify(['.html', '.xml'])],
                files: {
                    '.tmp/dist/browserify/main.js': ['js/main.js']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: false, src: ['.tmp/dist/browserify/main.js'], dest: '<%= dclConfig.dist %>/scripts/main.js', filter: 'isFile'},
                    {expand: true, cwd: './css',  src: ['*.css'], dest: '<%= dclConfig.dist %>/styles', filter: 'isFile'},
                    {expand: true, cwd: './assets',  src: ['*.png'], dest: '<%= dclConfig.dist %>/assets', filter: 'isFile'},
                    {expand: false, src: ['index.html'], dest: '<%= dclConfig.dist %>/index.html', filter: 'isFile'},
                    {expand: true, cwd: './partials', src: ['*.html'], dest: '<%= dclConfig.dist %>/partials/', filter: 'isFile'},
                    {expand: true, cwd: './fonts', src: ['*.*'], dest: '<%= dclConfig.dist %>/fonts/', filter: 'isFile'}
                ]
            }
        },
        bower: {
            dist: {
                dest: '<%= dclConfig.dist %>/components'
            },
            options: {
                expand: true
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: [{
                    expand: true,
                    cwd: 'css',
                    src: ['dclstyles.scss'],
                    dest: '<%= dclConfig.dist %>/styles',
                    ext: '.css'
                }]
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: ['.tmp', '<%= dclConfig.dist %>/*']
                }]
            }
        }
    });

    grunt.registerTask('build', [
        'clean:dist',
        'jshint:all',
        'jscs',
        'bower:dist',
        'browserify:dist',
        'sass:dist',
        'copy:dist'
    ]);
    grunt.registerTask('buildDev', [
        'clean:dist',
        'bower:dist',
        'browserify:dist',
        'sass:dist',
        'copy:dist'
    ]);
    grunt.registerTask('default', ['buildDev']);
};
