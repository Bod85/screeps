module.exports = function (grunt) {

    // Pull defaults (including username and token) from .screeps.json
    var config = require('./.screeps.json')
    if(!config.branch) {
      config.branch = 'sim'
    }
  
    if(!config.ptr) {
      config.ptr = false
    }
  
    // Allow grunt options to override default configuration
    var branch = grunt.option('branch') || config.branch;
    var email = grunt.option('email') || config.email;
    var token = grunt.option('token') || config.token;
    var ptr = grunt.option('ptr') ? true : config.ptr
  
    // Load needed tasks
    grunt.loadNpmTasks('grunt-screeps')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-file-append')
    grunt.loadNpmTasks("grunt-jsbeautifier")
  
  
    grunt.initConfig({
      // Push all files in the dist folder to screeps
      screeps: {
        options: {
          email: email,
          token: token,
          branch: branch,
          ptr: ptr
        },
        dist: {
          src: ['dist/*.js']
        }
      },
  
  
      // Combine groups of files to reduce the calls to 'require'
      concat: {
        // Merge together additions to the default game objects into one file
        extends: {
          src: ['dist/extend_*.js'],
          dest: 'dist/_extensions_packaged.js',
        },
  
        // Merge ScreepsOS into a single file in the specified order
        sos: {
          options: {
            banner: "var skip_includes = true\n\n",
            separator: "\n\n\n",
          },
          // Do not include console! It has to be redefined each tick
          src: ['dist/sos_config.js', 'dist/sos_interrupt.js', 'dist/sos_process.js', 'dist/sos_scheduler.js', 'dist/sos_kernel.js'],
          dest: 'dist/_sos_packaged.js',
        },
      },
  
      // Copy all source files into the dist folder, flattening the folder
      // structure by converting path delimiters to underscores
      copy: {
        screeps: {
          files: [{
            expand: true,
            cwd: 'src/',
            src: '**',
            dest: 'dist/',
            filter: 'isFile',
            rename: function (dest, src) {
              // Change the path name utilize underscores for folders
              return dest + src.replace(/\//g,'_');
            }
          }]
        },
      },
  
      // Add variable to mark this as packaged.
      file_append: {
        default_options: {
          files: [
            {
              prepend: "'use strict';\nglobal.GRUNT_PACKAGE=true\n",
              input: 'dist/main.js',
            }
          ]
        }
      },
  
      // Clean the dist folder.
      clean: {
        'dist': ['dist']
      },
  
      // Apply code styling
      jsbeautifier: {
        modify: {
          src: ["src/**/*.js"],
          options: {
            config: '.jsbeautifyrc'
          }
        },
        verify: {
          src: ["src/**/*.js"],
          options: {
            mode: 'VERIFY_ONLY',
            config: '.jsbeautifyrc'
          }
        }
      }
    })
  
    // Combine the above into a default task
    grunt.registerTask('default', ['clean', 'copy', 'concat', 'file_append', 'screeps']);
    grunt.registerTask('raw', ['clean', 'copy', 'screeps']);
    grunt.registerTask('package', ['clean', 'copy', 'concat', 'file_append']);
    grunt.registerTask('test', ['jsbeautifier:verify']);
    grunt.registerTask('pretty', ['jsbeautifier:modify']);
  }