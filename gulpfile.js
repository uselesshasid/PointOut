/// <binding AfterBuild='zipfiles' />
var gulp = require("gulp");
var zip = require("gulp-zip");
var ts = require("gulp-typescript");
var del = require("del");

var version = require('./manifest.json').version;

var tsProject = ts.createProject("tsconfig.json", {
})

gulp.task("build", function(){
    gulp.src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('scripts'));
})


gulp.task("copyfiles",function(){
    del(['scripts/**/*']);
    gulp.src([
        "bower_components/jquery/dist/jquery.min.js",
        "bower_components/jquery-ui/jquery-ui.min.js",
        "bower_components/jquery.scrollTo/jquery.scrollTo.min.js",
        "bower_components/toastr/toastr.min.js",
        "src/background.js",
        "src/contentscript.js",
        "src/dom.js",
        "src/jquery.extensions.js"
        ])
        .pipe(gulp.dest('scripts'));
})

gulp.task("zipfiles", function () {
    gulp.src(['scripts/**/*.js', 'css/*', 'icon.png', 'manifest.json', 'images/*'], { base: './' })
        .pipe(zip('PointOut_v' + version + '.zip'))
        .pipe(gulp.dest('dist'));
})

gulp.task('watch',function(){
    gulp.watch('src/**/*.ts',['build']);
})