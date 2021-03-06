var gulp = require('gulp');

// These paths need to be changed based on the location of the respective files on your application
var paths = {
  html:['views/**/*.html'],
  css:['public/**/*.css'],
  js:['app.js','public/**/*.js','routes/**/*.js'],
  clean:['reports/**/*']
};

gulp.task('default', function(callback) {
  var runSequence=require('run-sequence');
  runSequence('clean','lint', 'dev-unit', callback);
  });

  gulp.task('clean', function () {
      var clean = require('gulp-clean');
      return gulp.src(paths.clean, {read: false})
          .pipe(clean());
  });

/*
 Gulp tasks for linting
 */
gulp.task('lint', ['lint-js','lint-css', 'lint-jscs']);

// Use jshint to check Javascript syntax
gulp.task('lint-js', function() {
    var jshint = require('gulp-jshint');
    var mkdirp = require('mkdirp');
    mkdirp.sync('./reports');
    return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('jshint-junit-reporter',{ outputFile: "./reports/jshint.xml"}))
    .pipe(jshint.reporter('fail'));
});


// Use jscs to check for code style compliance
gulp.task('lint-jscs', function() {
    var jscs = require('gulp-jscs-with-reporter');
    var jscsJenkinsReporter = require('gulp-jenkins-reporter');
    var logCapture = require('gulp-log-capture');
    return gulp.src(paths.js)
    .pipe(jscs({
              "preset": "node-style-guide",
              "requireCapitalizedComments": { "allExcept":["jslint", "jshint"]},
              "requireCurlyBraces": null
          }))
    .pipe(jscs.reporter('fail'))
    .pipe(logCapture.start(console, 'log'))
    .pipe(jscs.reporter(jscsJenkinsReporter))
    .pipe(logCapture.stop('xml'))
    .pipe(gulp.dest('./reports'))
    ;
});

// Use csslint to check for CSS issues
gulp.task('lint-css', function() {
  var csslint=require('gulp-csslint');
  return gulp.src(paths.css)
    .pipe(csslint({
          "ids":false,
          "adjoining-classes": false,
          "box-sizing": false,
          "box-model": false,
          "compatible-vendor-prefixes": false,
          "font-sizes": false,
          "gradients": false,
          "important": false,
          "known-properties": false,
          "qualified-headings": false,
          "regex-selectors": false,
          "shorthand": false,
          "text-indent": false,
          "unique-headings": false,
          "universal-selector": false,
          "unqualified-attributes": false,
          "vendor-prefix": false,
          "overqualified-elements": false,
          "star-property-hack": false,
          "underscore-property-hack": false
        }))
    .pipe(csslint.reporter())
    .pipe(csslint.reporter('fail'))
    ;
  });


/*
Gulp tasks for unit tests
*/
gulp.task('dev-unit', ['dev-karma','dev-mocha']);

//Task for karma (frontend) unit tests
gulp.task('dev-karma', function(done) {
  var karma = require('karma').server;
  karma.start({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true,
  }, done);
});

//Task for mocha (server) unit tests
gulp.task('dev-mocha', function() {
  var mocha = require('gulp-mocha');
  var mkdirp = require('mkdirp');
  mkdirp.sync('./reports/api');
  return gulp.src('test/unit/server/**/*spec.js', {read: false})
    .pipe(mocha({
      globals:['expect'],
      timeout: 3000,
      ignoreLeaks: true,
      ui: 'bdd',
      colors: true,
      reporter: 'mocha-jenkins-reporter',
      reporterOptions: {
        junit_report_name: 'Mocha Unit Tests for Server',
        junit_report_path: './reports/mocha-report.xml',
        junit_report_stack: 1,
      },
    }));
});

gulp.task('dev-setup', function() {
  var bower = require('gulp-bower');
  return bower();
});
