'use strict';

const yaml          = require('js-yaml') ;
const browser       = require('browser-sync') ;
const plumber       = require('gulp-plumber') ;
const fs            = require('fs') ;
const gulp          = require('gulp') ;
const nunjucks      = require('gulp-nunjucks-render') ;
const data          = require('gulp-data') ;
const del           = require('del');

const PATHS = {
  src: './src/{layouts,partials,templates}/**/*.mjml',
  data: './src/data/data.yml',
  assets: './src/assets/',
  layouts: './src/layouts/',
  partials: './src/partials/',
  templates: './src/templates/**/*.mjml',
  mjml: {
    src: './dist/code/mjml/**/*.mjml',
    dist: './dist/code/mjml/',
  },
  htmlDist: './dist/code/html',
  dist: './dist/',
  startPath: './dist/code/html/index.html'
}
export const customPlumber = (errTitle) => {
  return plumber({
    errorHandler: notify.onError({
      title: errTitle || "Error running Gulp",
      message: "Error: <%= error.message %>",
    })
  });
}

export const clean = () => {
  return del(['./dist/code/**/**']);
}

function load_data() {
  let yml = fs.readFileSync(PATHS.data, 'utf8')
  return yaml.load(yml);
}

export function buildTemplates() {
  return gulp.src(PATHS.templates)
    .pipe(data(load_data))
    .pipe(nunjucks({
      path: [
        PATHS.layouts,
        PATHS.partials,
        PATHS.assets
      ],
      envOptions: {
        noCache: true
      },
      inheritExtension: true
    }))
    .pipe(gulp.dest(PATHS.mjml.dist));
}

export function server(done) {
  const options = {
    server: {
      baseDir: PATHS.dist,
      startPath: PATHS.startPath,
      directory: true
    },
    port: '8000',
    notify: false
  };

  browser.init(options);
  done();
}

export function watch() {
  gulp.watch(PATHS.data).on('all', gulp.series(buildTemplates, browser.reload));
  gulp.watch(PATHS.src).on('all', gulp.series(buildTemplates, browser.reload));
}

gulp.task('build',
  gulp.series(clean, buildTemplates));

gulp.task('default',
  gulp.series('build', gulp.parallel(server, watch)));