module.exports = function(grunt) {

    require('time-grunt')(grunt);
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    var config = {
        package: 'package'
    };

    grunt.initConfig({
        dclConfig: config,
        run_grunt: {
            options: {minimumFiles: 1},
            dclserver : {
                options: {
                    cwd: './server',
                    log:true
                },
                src: ['./server/Gruntfile.js']
            },
            dclclient: {
                options: {
                    cwd:'./client',
                    log:true
                },
                src: ['./client/Gruntfile.js']
            }
        },
        copy: {
            release: {
                files: [
                    {expand: true, src: ['./server/**', '!**/*.log', '!./server/node_modules/**'], dest: '<%= dclConfig.package %>/'},
                    {expand: false, src: ['./server/config-production.json'], dest: '<%= dclConfig.package %>/server/config.json'},
                    {expand: false, src: ['./server/CommonConfigs.json'], dest: '<%= dclConfig.package %>/server/CommonConfigs.json'},
                    {cwd: './client', expand: true, src: ['./dist/**', '!**/*.log'], dest: '<%= dclConfig.package %>/'}
                ]
            }
        },
        compress: {
            release: {
                options: {
                    archive: '<%= dclConfig.package %>.tgz',
                    mode: 'tgz'
                },
                expand: true,
                src: ['<%= dclConfig.package %>/**/*'],
                dest: './'
            }
        },
        clean: {
            release: {
                files: {src: ['<%= dclConfig.package %>']}
            }
        },
        mkdir: {
            release: {
                options: {
                    create: ['<%= dclConfig.package %>']
                }
            }
        },
        run: {
            options: {
                cwd: './server'
            },
            startServer: {
                cmd: 'npm',
                args: ['start']
            }
        }
    });

    grunt.registerTask('startServer', ['run:startServer']);
    grunt.registerTask('buildClient', ['run_grunt:dclclient']);
    grunt.registerTask('buildServer', ['run_grunt:dclserver']);
    grunt.registerTask('release', ['clean:release', 'mkdir:release', 'run_grunt:dclclient', 'copy:release', 'compress:release']);
};
