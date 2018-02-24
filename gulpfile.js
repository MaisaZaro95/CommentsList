var gulp = require('gulp');
var gutil = require('gulp-util');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var inject = require('gulp-inject');
var imagemin = require('gulp-imagemin');
var iife = require("gulp-iife");
var cleanCSS = require('gulp-clean-css');
var jshint = require('gulp-jshint');

var Server = require('karma').Server;

gulp.task('default', ['serve']);

gulp.task('init', ['sass', 'bower', 'js', 'uglify-js', 'image', 'image-min', 'html', 'index']);

// Static Server + watching js/scss/html files
gulp.task('serve', ['init'], function() {

    browserSync.init({
        server: {
            baseDir: './dev'
        }
    });

    /* If you use a proxy replace the previous code with the below script replacing 'yourlocal.dev' with your local proxy
       
        browserSync.init({
            proxy: 'yourlocal.dev'
        });

   */

    gulp.watch('./scss/*.scss', ['sass-watch']);

    gulp.watch('./public/images/*', ['image-watch']);

    gulp.watch('./public/**/*.html', ['html-watch']);

    gulp.watch('./public/js/**/*.js', ['js-watch']);

    gulp.watch('./bower_components/**/*.js', ['bower']);
});

var combiner = require('stream-combiner2');
var uglify = require('gulp-uglify');

gulp.task('test', function() {
  return combiner.obj([
      gulp.src('bootstrap/js/*.js'),
      uglify(),
      gulp.dest('public/bootstrap')
    ])
    // any errors in the above streams will get caught
    // by this listener, instead of being thrown:
    .on('error', console.error.bind(console));
});


gulp.task('index', function() {
    var target = gulp.src('./dev/index.html');
    var sources = gulp.src(['./bower_components/**/*.js', './public/js/config/app.js', './public/js/factories/**/*.js', './public/js/services/**/*.js', './public/js/controllers/**/*.js', './public/js/filters/**/*.js', './public/js/directives/**/*.js', './bower_components/**/*.css', './public/css/**/*.css'], { read: false });

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./dev'))
});

gulp.task('html', function() {
    return gulp.src('./public/**/*.html')
        .pipe(gulp.dest('./dev'))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});
const jsValidate = require('gulp-jsvalidate');

gulp.task('default', () =>
	gulp.src('AddComment-controller.js')
		.pipe(jsValidate())
);

gulp.task('image', function() {
    return gulp.src('./public/images/*')
        .pipe(gulp.dest('./dev/public/images'))
        .pipe(gulp.dest('./dist/public/images'))
        .pipe(browserSync.stream());
});


// Command line option:
//  --fatal=[warning|error|off]
var fatalLevel = require('yargs').argv.fatal;

var ERROR_LEVELS = ['error', 'warning'];

// Return true if the given level is equal to or more severe than
// the configured fatality error level.
// If the fatalLevel is 'off', then this will always return false.
// Defaults the fatalLevel to 'error'.
function isFatal(level) {
   return ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf(fatalLevel || 'error');
}

// Handle an error based on its severity level.
// Log all levels, and exit the process for fatal levels.
function handleError(level, error) {
   gutil.log(error.message);
   if (isFatal(level)) {
      process.exit(1);
   }
}

// Convenience handler for error-level errors.
function onError(error) { handleError.call(this, 'error', error);}
// Convenience handler for warning-level errors.
function onWarning(error) { handleError.call(this, 'warning', error);}

var testfiles = ['error.js', 'warning.js'];

// Task that emits an error that's treated as a warning.
gulp.task('warning', function() {
   gulp.src(testfiles).
      pipe(jshint()).
      pipe(jshint.reporter('fail')).
      on('error', onWarning);
});
gulp.task('watch', function() {
   // By default, errors during watch should not be fatal.
   fatalLevel = fatalLevel || 'off';
   gulp.watch(testfiles, ['error']);
});

gulp.task('default', ['watch']);


// Task that emits an error that's treated as an error.
gulp.task('error', function() {
   gulp.src(testfiles).
      pipe(jshint()).
      pipe(jshint.reporter('fail')).
      on('error', onError);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./public/css'))
        .pipe(gulp.dest('./dev/public/css'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('./dist/public/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', function() {
    return gulp.src('./public/js/**/*.js')
        .pipe(gulp.dest('./dev/public/js'))
});

gulp.task('bower', ['index', 'index:dist'], function() {
    return gulp.src(['./bower_components/**/*.min.js', './bower_components/**/*.min.css'])
        .pipe(gulp.dest('./dev/bower_components'))
        .pipe(gulp.dest('./dist/bower_components'));
});

gulp.task('image-watch', ['image', 'image-min'], function(done) {
    browserSync.reload();
    done();
});

gulp.task('html-watch', ['html'], function(done) {
    browserSync.reload();
    done();
});

gulp.task('sass-watch', ['sass', 'index', 'index:dist'], function(done) {
    browserSync.reload();
    done();
});

gulp.task('js-watch', ['js', 'uglify-js', 'index', 'index:dist'], function(done) {
    browserSync.reload();
    done();
});

//DIST:

gulp.task('image-min', function() {
    gulp.src(['./public/**/*.png', './public/**/*.jpg', './public/**/*.gif', './public/**/*.jpeg'])
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/public'));
});

gulp.task('uglify-js', function() {
    return gulp.src(['./public/js/config/app.js', './public/js/factories/**/*.js', './public/js/services/**/*.js', './public/js/controllers/**/*.js', './public/js/filters/**/*.js', './public/js/directives/**/*.js'])
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest('./public/js/min/'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/js/min/'));
});

gulp.task('index:dist', function() {
    var target = gulp.src('./dist/index.html');
    var sources = gulp.src(['./bower_components/**/*.js', './public/js/min/anonymous.min.js', './bower_components/**/*.css', './public/css/**/*.css'], { read: false });

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./dist'))
});

gulp.task('dist:iife', function() {
    return gulp.src('./public/js/min/all.min.js')
        .pipe(iife())
        .pipe(rename('./js/min/anonymous.min.js'))
        .pipe(gulp.dest('./public'))
        .pipe(gulp.dest('./dist/public'));
});

gulp.task('serve:dist', ['dist:package'], function() {

    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });

    /* If you use a proxy replace the previous code with the below script replacing 'yourlocal.dev' with your local proxy
       
        browserSync.init({
            proxy: 'yourlocal.dev'
        });

   */

    gulp.watch('./scss/*.scss', ['sass-watch']);

    gulp.watch('./public/images/*', ['image-watch']);

    gulp.watch('./public/**/*.html', ['html-watch']);

    gulp.watch('./public/js/**/*.js', ['js-watch']);

    gulp.watch('./bower_components/**/*.js', ['bower']);
});

gulp.task('dist:package', ['sass', 'bower', 'uglify-js', 'image', 'image-min', 'html', 'dist:iife', 'index:dist']);


//TDD

/* Run test once and exit */

gulp.task('spec', function(done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

/* Watch for file changes and re-run tests on each change */

gulp.task('serve:spec', function(done) {
    new Server({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});
