(function () {

  var gulp = require('gulp');
  var del = require('del');
  var concat = require('gulp-concat');
  var rename = require('gulp-rename');
  var uglify = require('gulp-uglify');
  var conf = {
    src: 'src',
    dist: 'dist'
  };

  gulp.task('clean', function () {
    del(conf.dist);
  });

  gulp.task('uglify', ['clean'], function () {
    gulp.src([
        conf.src + '/CustomEvent.js',
        conf.src + '/Event.js'
      ])
      .pipe(concat('next-dom-event.js'))
      //.pipe(uglify())
      //.pipe(rename({
      //  extname: '.min.js'
      //}))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('default', ['uglify']);

}());
