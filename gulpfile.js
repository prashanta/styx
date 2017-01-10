var gulp = require('gulp');
var path = require('path');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var eslint = require('gulp-eslint');
var spawn = require('child_process').spawn;
var node;

gulp.task('lint', function(){
    return gulp.src(['./src/server/**/**/*.js', '!node_modlues/**'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('server', ['build'], function() {
  if (node) node.kill();
  node = spawn('node', ['index.js'], {stdio: 'inherit'});
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
  gulp.watch(['./src/client/**/*.js'], ['build']);
});

gulp.task('build', function(){
    var entries = [
        './src/client/index.js'
    ];

    entries.forEach(function(entry){
        var bundler = browserify(entry, {detectGlobals: true});
        bundler.transform(babelify);
        bundler.bundle()
        .on('error', function (err) { console.error(err); })
        .pipe(source(path.basename(entry)))
        .pipe(rename({extname : '.bundle.js'}))
        .pipe(buffer())
        .pipe(gulp.dest('./public/build'));
    });
});

gulp.task('default', ['server'], function(){
    gulp.watch(['./src/server/**/*.js'], ['server']);
});
