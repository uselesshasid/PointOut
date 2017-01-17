/// <binding AfterBuild='zipfiles' />
var gulp = require("gulp");
var zip = require("gulp-zip");
var ts = require("gulp-typescript");

var version = require('./manifest.json').version;

var tsProject = ts.createProject("tsconfig.json", {
})

gulp.task("compile-ts", function(){
    gulp.src('scripts/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('scripts'));
})

gulp.task("zipfiles", function () {
    gulp.src(['scripts/**/*.js', 'css/*', 'icon.png', 'manifest.json', 'images/*'], { base: './' })
        .pipe(zip('PointOut_v' + version + '.zip'))
        .pipe(gulp.dest('dist'));
})

gulp.task('watch',function(){
    gulp.watch('scripts/**/*.ts',['compile-ts']);
})