'use strict';
/*!
 * Module dependencies.
 */

var rest = require('restler');
var _ = require('lodash');

// create a service constructor for very easy API wrappers a la HTTParty...
var Minute = rest.service(function() {}, {
  baseURL: 'http://localhost:8000'
}, {

    fetchArticles: function(language, originalLanguage) {

        var query = { 'language__short_code': language };
        if(originalLanguage) {
            query['article__source__language__short_code'] = originalLanguage;
        }
        return this.get('/api/translated-articles', { query: query});
    },

    fetchArticle: function(language, slug) {
        return this.get('/api/translated-articles', { 
            query: { 
                'language__short_code': language,
                slug: slug
            }
        });  
    }

});

var client = new Minute();


exports.home = function (req, res) {

    console.log('helllo');
    return res.redirect('/en');
};


exports.listArticles = function(req, res) {

    var language = req.params.language;
    var originalLanguage = req.query.language;


    client.fetchArticles(language, originalLanguage).on('success', function(response) {

        var articles = response.results;

        res.render('index', {
            articles: articles,
            language: language
        });

    });

};


exports.readArticle = function(req, res) {

    var language = req.params.language;
    var slug = req.params.slug;

    client.fetchArticle(language, slug).on('complete', function(response) {

        var articles = response.results;

        if(!articles.length) {
            return res.status(404).send();
        }


        return res.render('articles/index', {
            article: articles[0],
            language: language
        });
    });

};
