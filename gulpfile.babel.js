'use strict';

import yaml          from 'js-yaml';
import browser       from 'browser-sync';
import plumber       from 'gulp-plumber';
// import rimraf        from 'rimraf';
import fs            from 'fs';
import gulp          from 'gulp';
import mjmlGulp      from 'gulp-mjml';
import mjml          from 'mjml';
import nunjucks      from 'gulp-nunjucks-render';
import data          from 'gulp-data';
import del           from 'del';

const PATHS = {
  src: './src/{layouts,partials,views}/**/*.mjml',
  data: './src/data/data.yml',
  assets: './src/assets/',
  layouts: './src/layouts/',
  partials: './src/partials/',
  views: './src/views/**/*.mjml',
  mjml: {
    src: './dist/code/mjml/**/*.mjml',
    dist: './dist/code/mjml/',
  },
  htmlDist: './dist/code/html',
  dist: './dist/',
  serverPath: './dist/code/html',
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
  return gulp.src(PATHS.views)
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

export function buildMjml() {

  return gulp.src(PATHS.mjml.src)
    .pipe(mjmlGulp(mjml))
    .pipe(gulp.dest(PATHS.htmlDist));
}

export function server(done) {
  const options = {
    server: {
      baseDir: PATHS.serverPath,
      startPath: PATHS.startPath,
      directory: false
    },
    port: '8000',
    notify: false
  };

  browser.init(options);
  done();
}

export function watch() {
  gulp.watch(PATHS.data).on('all', gulp.series(buildTemplates, buildMjml, browser.reload));
  gulp.watch(PATHS.src).on('all', gulp.series(buildTemplates, buildMjml, browser.reload));
}

gulp.task('build',
  gulp.series(clean, buildTemplates, buildMjml));

gulp.task('default',
  gulp.series('build', gulp.parallel(server, watch)));