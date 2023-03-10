"use strict";

const { watch, src, dest, series, parallel } = require("gulp");
const clean = require("gulp-clean");
const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const sass = require("gulp-sass")(require("sass"));
const browserify = require('browserify');
const babelify = require("babelify");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require("browser-sync").create();
const favicons = require("gulp-favicons");

const clear = () => {
  return src('./build', {
      allowEmpty: true
    })
		.pipe(clean());
}

const buildHtml = () => {
  return src("./src/index.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest("./build/"))
    .pipe(browserSync.stream());
};

const buildSass = () => {
  return src("./src/styles/**/*.scss")
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(dest("./build/styles/"))
    .pipe(browserSync.stream());
};

const buildJs = () =>{
  return browserify({
    entries: './src/javascript/index.js',
    debug: true
    })
    .transform(babelify.configure({
      presets: ["@babel/preset-env"]
    }))
    .bundle()
    .pipe(source("app.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(dest("./build/js/"))
}

const imagesOptimize = () => {
  return src("./src/images/*.{png,svg,jpg,jpeg}")
    .pipe(imagemin())
    .pipe(dest("./build/images"));
};

const buildFavicon = () => {
  return src("./favicon.png")
    .pipe(
      favicons({
        appName: "My App",
        appShortName: "App",
        appDescription: "This is my application",
        background: "#020307",
        path: "",
        url: "http://localhost:3000",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/?homescreen=1",
        version: 1.0,
        logging: false,
        html: './build/index.html',
        pipeHTML: true,
        replace: true,
      })
    )
    .pipe(dest("./build"));
};

const build = series(
  clear,
  parallel(buildHtml, buildSass, buildJs, imagesOptimize, buildFavicon)
);

const runServer = () => {
  browserSync.init({
    open: false,
    server: "./build",
  });

  watch("./src/javascript/**/*.js", buildJs);
  watch("./src/styles/**/*.scss", buildSass);
  watch("./src/*.html", buildHtml);
};

exports.develop = series(build, runServer);
