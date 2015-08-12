'use strict';
/*!
 * Module dependencies.
 */

var rest = require('restler');
var _ = require('lodash');
var fakeArticles = require('../../sample-data/articles');

// create a service constructor for very easy API wrappers a la HTTParty...
var Minute = rest.service(function() {}, {
  baseURL: 'http://7f85ccfb.ngrok.com'
}, {

    fetchArticles: function(language, originalLanguage) {

        var query = { 'language__short_code': language };
        if(originalLanguage) {
            query['article__source__language__short_code'] = originalLanguage;
        }
        return this.get('/api/translated-articles', { query: query});
    },

    fetchArticle: function(language, slug) {
        return this.get('/api/translated-articles/', { 
            query: { 
                'language__short_code': language,
                slug: slug,
                format: 'json'
            }
        });  
    }

});

var client = new Minute();


exports.home = function (req, res) {
    return res.redirect('/en');
};


exports.listArticles = function(req, res) {
    var language = req.params.language;
    var originalLanguage = req.query.language;

    client
        .fetchArticles(language, originalLanguage)
        .on('success', function(response) {
            var articles = response.results;

            articles = _.groupBy(articles, function(a) {
                return a.article.source.name;
            });
            res.render('index', {
                articleSources: articles,
                language: language
            });
        }).on('error', function(err) {
            console.log('err')
            res.render('index', {
                articles: fakeArticles,
                language: language
            });
        }).on('fail', function(err) {
            console.log('fail')
            res.render('index', {
                articles: fakeArticles,
                language: language
            });
        });

};


exports.readArticle = function(req, res) {
    var language = req.params.language;
    var slug = req.params.slug;

    client
        .fetchArticle(language, slug)
        .on('success', function(response) {
            var articles = response.results;
            if(!articles.length) {
                return res.status(404).send();
            }


            return res.render('articles/index', {
                article: articles[0],
                language: language
            });
        }).on('error', function(err) {
            res.render('articles/index', {
                article: fakeArticles[0],
                language: language
            });
        }).on('fail', function(err) {
            res.render('articles/index', {
                article: fakeArticles[0],
                language: language
            });
        });
};
