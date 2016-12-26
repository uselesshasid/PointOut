/// <binding AfterBuild='zipfiles' />
var gulp = require("gulp");
var zip = require("gulp-zip");
var version = require('./manifest.json').version;

gulp.task("zipfiles", function () {
    gulp.src(['scripts/*', 'css/*', 'icon.png', 'manifest.json', 'images/*'], { base: './' })
        .pipe(zip('PointOut_v' + version + '.zip'))
        .pipe(gulp.dest('dist'));
})