'use strict';

import yaml          from 'js-yaml';
import browser       from 'browser-sync';
import rimraf        from 'rimraf';
import fs            from 'fs';
import gulp          from 'gulp';
import mjmlGulp      from 'gulp-mjml';
import mjml          from 'mjml';
import nunjucks      from 'gulp-nunjucks-render';
import data          from 'gulp-data';

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

function load_data() {
  let yml = fs.readFileSync(PATHS.data, 'utf8')
  return yaml.load(yml);
}

export function clean(done) {
  rimraf('./dist/code/**/**', done);
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

export function buildMjml() {
  const options = {
    beautify: true,
    minify: false
  };

  return gulp.src(PATHS.mjml.src)
    .pipe(mjmlGulp(mjml, options))
    .pipe(gulp.dest(PATHS.htmlDist));
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
  gulp.watch(PATHS.data).on('all', gulp.series(buildTemplates, buildMjml, browser.reload));
  gulp.watch(PATHS.src).on('all', gulp.series(buildTemplates, buildMjml, browser.reload));
}

gulp.task('build',
  gulp.series(clean, buildTemplates, buildMjml));

gulp.task('default',
  gulp.series('build', gulp.parallel(server, watch)));