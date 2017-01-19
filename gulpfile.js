/// <binding AfterBuild='zipfiles' />
var gulp = require("gulp");
var zip = require("gulp-zip");
var ts = require("gulp-typescript");
var gulpclean = require("gulp-clean");

var version = require('./manifest.json').version;

var tsProject = ts.createProject("tsconfig.json", {
})

gulp.task("build", function(){
    gulp.src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('scripts'));
})


gulp.task("copyfiles",function(){
    gulp.src('scripts\*',{read:false}).pipe(gulpclean());
    gulp.src([
        "node_modules/jquery/dist/jquery.min.js", 
        "node_modules/jquery-ui/dist/jquery-ui.js", 
        "node_modules/jquery-scrollto/out/lib/jquery-scrollto.js", 
        "node_modules/toastr/build/toastr.min.js",
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