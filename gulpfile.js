'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var livereload = require('gulp-livereload');
var tinylr = require('tiny-lr');
var server = tinylr();
var jade = require('gulp-jade');
var path = require('path');
var express = require('express');
var app = express();
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var s3 = require('gulp-s3');
var d3 = require('d3');
var gzip = require('gulp-gzip');
var colors = require('colors');
var rename = require('gulp-rename');
var _ = require('lodash');


var fakeArticle = {
    title: 'Water Pricing in Two Thirsty Cities: In One, Guzzlers Pay More, and Use Less',
    top_image: 'http://static01.nyt.com/images/2015/05/06/business/20150507WATERMARKETS-SS-slide-XI20/20150507WATERMARKETS-SS-slide-XI20-jumbo.jpg',
    text: 'FRESNO, Calif. — When residents of this parched California city opened their water bills for April, they got what Mayor Ashley Swearengin called “a shock to the system. ”The city had imposed a long-delayed, modest rate increase — less than the cost of one medium latte from Starbucks for the typical household, and still leaving the price of water in Fresno among the lowest across the entire Western United States. But it was more than enough to risk what the mayor bluntly admits could be political suicide .“It wasn’t that long ago,” Ms. Swearengin said, “that people here were fighting the installation of water meters. ”Nearly 15 years ago and 1,000 miles away in Santa Fe, N.M., officials faced a similarly dire predicament when a drought came within a few thousand gallons of leaving the city without enough water to fight fires. But Santa Fe’s response was far more audacious .Santa Fe, in addition to raising the basic cost of water, decided to make the heaviest users of water pay more — much more — for the water they consumed .Known as tiered pricing, the system wasn’t new or unique to Santa Fe, but in no major city today are the tiers so steep, with water guzzlers paying three to four times more per gallon than more efficient consumers are charged .“It was a big wake-up call,” said Rick Carpenter, manager of water resources and conservation for Santa Fe. “There was some opposition, and it could easily have gone the other way. But the majority saw we needed to band together on this one. ”In moving away from the idea that water should be cheap for everybody just because it is so essential to life, Santa Fe’s approach to water pricing offers lessons in how other parched cities can balance the societal costs of scarcer, more expensive water in a relatively equitable way .Because of the huge gap between tiers, the biggest consumers effectively subsidize everyone else, shielding poorer residents from feeling the full brunt of rate increases .“So much turns on pricing when it comes to water,” said Robert Glennon, a professor at the Rogers College of Law at the University of Arizona and the author of “Unquenchable: America’s Water Crisis and What to Do About It,” a 2009 book on water policy.'
}


var fakeArticleList = _.map(_.range(30), function() {
    return fakeArticle
});

var PRODUCTION_MODE = gutil.env.production;
var projectName = require('./package').name;


gulp.task('js-lib', function() {
    return gulp.src('src/js/lib/**/*.js')
            .pipe(gulpif(PRODUCTION_MODE, uglify()))
            .pipe(gulp.dest('./public/js/lib/'))
            .pipe( livereload( server ));
});

gulp.task('gzip', ['build'], function() {
    return gulp.src('public/**/*.{js,css}')
                .pipe(gzip())
                .pipe(rename(function(path) {
                    path.extname = '';
                }))
                .pipe(gulp.dest('./public/'));
});

gulp.task('browserify', function() {
    // Single entry point to browserify
    return gulp.src('src/js/app.js')
        .pipe(browserify({
            debug : !PRODUCTION_MODE
        }))
        .on('error', gutil.log)
        .on('error', gutil.beep)
        .pipe(gulpif(PRODUCTION_MODE, uglify()))
        .pipe(gulp.dest('./public/js/'))
        .pipe( livereload( server ));
});


gulp.task('css', function() {
    return gulp
            .src('src/stylesheets/app.scss')
            .pipe(
                sass({
                    includePaths: ['src/stylesheets'],
                    errLogToConsole: true
                }))
            .pipe( gulpif(PRODUCTION_MODE, csso()) )
            .pipe( gulp.dest('./public/css/') )
            .pipe( livereload( server ));
});


gulp.task('fonts', function() {
    return gulp
            .src('src/fonts/**/*.{otf,svg,ttf,woff,eot}')
            .pipe( gulp.dest('./public/fonts/') )
            .pipe( livereload( server ));
});

gulp.task('images', function() {
    return gulp
            .src('src/images/**/*')
            .pipe( gulp.dest('./public/images/') )
            .pipe( livereload( server ));
});

gulp.task('jade', function() {

    delete require.cache[require.resolve('./src/js/utils')];
    var utils = require('./src/js/utils');
    
    var host = '/interactives/' + projectName + '/';

    if(!PRODUCTION_MODE) {
        host = '/';
    }

    return gulp.src('src/templates/**/index.jade')
               .pipe(jade({
                    pretty: !PRODUCTION_MODE,
                    locals: {
                        utils: utils,
                        d3: d3,
                        STATIC_URL: host,
                        _: _,
                        fakeArticle: fakeArticle,
                        fakeArticleList: fakeArticleList
                    }
               }))
               .on('error', gutil.log)
               .on('error', gutil.beep)
               .pipe(gulp.dest('./public/'))
               .pipe( livereload( server ));
});

gulp.task('templates', ['static'], function() {
    return gulp.start('jade');
});


gulp.task('express', function() {
    app.use(express.static(path.resolve('./public')));
    app.listen(8000);
    gutil.log('Listening on port: 8000');
});
 
gulp.task('watch', function () {
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }
 
    gulp.watch('src/stylesheets/**/*.{scss,css}',['css', 'jade']);
    gulp.watch('src/js/**/*.js',['js']);
    gulp.watch('src/templates/**/*.jade',['jade', 'js']);
  });
});


gulp.task('gzip', ['build'], function() {
    return gulp.src('public/**/*.{js,css}')
                .pipe(gzip())
                .pipe(rename(function(path) {
                    path.extname = '';
                }))
                .pipe(gulp.dest('./public/'));
});

gulp.task('deploy', ['gzip'], function() {
    

    // gutil.log('Deploying to ' + stage);

    var aws;
    try {
        aws = {
              'key': process.env.AWS_KEY,
              'secret': process.env.AWS_SECRET,
              'bucket': 'interactives'
        };

        if(!aws.key || !aws.secret) {
            new Error('Must have both AWS_KEY and AWS_SECRET env variables set');
        }
    } catch(err) {
        gutil.log('Could not parse aws keys from keys.json. Aborting deployment.'.red);
        return;
    }

    gulp.src(['./public/**', '!./public/**/*.{js,css,gz}'], { read: false })
        .pipe(s3(aws, {
            uploadPath: '/interactives/' + projectName + '/',
            headers: {
                'Cache-Control': 'max-age=300, no-transform, public'
            }
        }));
    gulp.src('./public/**/*.{js,css,gz}', { read: false })
        .pipe(s3(aws, {
            uploadPath: '/interactives/' + projectName + '/',
            headers: {
                'Cache-Control': 'max-age=300, no-transform, public',
                'Content-Encoding': 'gzip'
            }
        }));

});


gulp.task('js', ['browserify','js-lib']);
gulp.task('static', ['js', 'css', 'fonts', 'images']);
gulp.task('default', ['templates','express','watch']);
gulp.task('build', ['templates']);
