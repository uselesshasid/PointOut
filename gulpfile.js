/// <binding AfterBuild='zipfiles' />
var gulp = require("gulp");
var zip = require("gulp-zip");

gulp.task("zipfiles", function () {
    gulp.src(['scripts/*', 'css/*', 'icon.png', 'manifest.json', 'images/*'], { base: './' })
        //TODO: read config file
        //TODO: extract the version number
        //TODO: suffix file name with the version number i.e. PointOut_v1.1.0.zip
        .pipe(zip('PointOut.zip'))
        .pipe(gulp.dest('dist'));
})