'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp/**',
            '<%= yeoman.dist %>/**',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp/**'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        exclude: [
          'bootstrap-sass-official'
        ],
        ignorePath: '<%= yeoman.app %>/'
      }
    },

    wiredepCopy: {
      dev: {
        options: {
          src: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          wiredep: '<%= wiredep.app %>'
        }
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '*.html',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    uglify: {
      options: {
        // jshint camelcase: false
        mangle: {
          screw_ie8: true
        },
        compress: {
          screw_ie8: true,
          sequences: true,
          properties: true,
          dead_code: true,
          drop_debugger: true,
          comparisons: true,
          conditionals: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          if_return: true,
          join_vars: true,
          cascade: true,
          drop_console: true
        }
      }
    },

    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      common: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              '*.html',
              'images/{,*/}*.{webp}',
              'fonts/*'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= yeoman.dist %>/images',
            src: ['generated/*']
          }
        ]
      },
      dist: {
        files: [
          '<%= copy.common.files %>',
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/font-awesome/',
            dest: '<%= yeoman.dist %>',
            src: 'fonts/*'
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components/leaflet-fullscreen/',
            dest: '<%= yeoman.dist %>/styles',
            src: '*.png'
          }
        ]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      },
      dev: {
        files: [
          '<%= copy.common.files %>',
          {
            expand: true,
            cwd: '<%= yeoman.app %>/',
            dest: '<%= yeoman.dist %>',
            src: [
              'scripts/{,*/}*.js',
              'images/{,*/}*',
              'templates/{,*/}*.html',
              'views/{,*/}*.html',
              'bower_components/leaflet-fullscreen/*.png',
              'bower_components/font-awesome/fonts/*'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/styles',
            dest: '<%= yeoman.dist %>/styles',
            src: '{,*/}*.css'
          }
        ]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dev: [
        'compass'
      ],
      prod: [
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    ngconstant: {
      options: {
        name: 'config',
        dest: '<%= yeoman.app %>/scripts/config.js',
        template: grunt.file.read('.ngconstant.tpl.ejs'),
        serializerOptions: {
          indent: '  ',
          // jshint camelcase: false
          no_trailing_comma: true
        },
        constants: {
          SETTINGS: grunt.file.readJSON('config/common.json')
        }
      },
      dev: {
        constants: {
          SETTINGS: grunt.file.readJSON('config/dev.json')
        }
      },
      prod: {
        constants: {
          SETTINGS: grunt.file.readJSON('config/prod.json')
        }
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    ngtemplates: {
      sedApp: {
        options: {
          htmlmin: '<%= htmlmin.dist.options %>',
          usemin: 'scripts/scripts.js'
        },
        cwd: '<%= yeoman.app %>',
        src: [
          'templates/**/*.html',
          'views/**/*.html'
        ],
        dest: '.tmp/concat/scripts/templates.js'
      }
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      e2e: {
        options: {
          args: {
            seleniumServerJar: './node_modules/grunt-protractor-runner/node_modules/protractor/selenium/selenium-server-standalone-2.42.2.jar',
            chromeDriver: './node_modules/grunt-protractor-runner/node_modules/protractor/selenium/chromedriver'
          }
        }
      },
      saucelabs: {
        options: {
          args: {
            sauceUser: process.env.SAUCE_USERNAME,
            sauceKey: process.env.SAUCE_ACCESS_KEY
          }
        }
      }
    }
  });

  grunt.registerTask('serve', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    } else if (target === 'prod') {
      return grunt.task.run(['build:prod', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'ngconstant:dev',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', function(target) {
    var common = [
      'clean:server',
      'ngconstant:dev',
      'concurrent:test',
      'autoprefixer',
      'connect:test'
    ];

    if (target === 'e2e') {
      return grunt.task.run(common.concat(['protractor:e2e']));
    }
    if (target === 'unit') {
      return grunt.task.run(common.concat(['karma']));
    }

    if (target === 'travis') {
      common.push('karma');

      var nonFork = 'eHealthAfrica/sense-ebola-dashboard';
      if (process.env.TRAVIS_REPO_SLUG === nonFork) {
        common.push('protractor:saucelabs');
      }

      return grunt.task.run(common);
    }

    grunt.task.run(common.concat(['karma', 'protractor:e2e']));
  });

  grunt.registerTask('build', function(target) {
    var common = [
      'clean:dist',
      'wiredep'
    ];

    var dev = [
      'ngconstant:dev',
      'concurrent:dev',
      'autoprefixer',
      'copy:dev',
      'wiredepCopy:dev'
    ];

    var prod = [
      'ngconstant:prod',
      'useminPrepare',
      'concurrent:prod',
      'autoprefixer',
      'ngtemplates',
      'concat',
      'ngAnnotate',
      'copy:dist',
      'cssmin',
      'uglify',
      'rev',
      'usemin',
      'htmlmin'
    ];

    if (target === 'prod') {
      grunt.task.run(common.concat(prod));
    } else {
      grunt.task.run(common.concat(dev));
    }
  });

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
