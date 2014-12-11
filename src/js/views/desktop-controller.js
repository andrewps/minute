'use strict';

var _ = require('lodash');
var utils = require('../utils');
var htmlContent = require('../../templates/includes/desktop-content.jade');
// var Viz = require('../viz/viz');

/*
 * View controller
 */
function DesktopViewController($el) {
    if (!(this instanceof DesktopViewController)) {
        return new DesktopViewController($el);
    }

    this.$el = $el;
    this.$el.html(htmlContent({
        // template variables go here
        // e.g.
        //
        // someVar: something
    }));

    // Opens Hamburgler Menu
    $(".icon").click(function () {
        $(".mobilenav").fadeToggle(250);
        $(".mobilenav li").toggleClass('slideInLeft');
        // Need slideOutLeft for closing menu
        $(".top-menu").toggleClass("top-animate");
        $(".mid-menu").toggleClass("mid-animate");
        $(".bottom-menu").toggleClass("bottom-animate");
    });
}



DesktopViewController.prototype.destroy = function() {
    this.$el.find('*').unbind().html();
};

module.exports = DesktopViewController;
