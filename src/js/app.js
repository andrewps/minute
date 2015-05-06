'use strict';

//
// app.js is the entry point for the entire client-side
// application. Any necessary top level libraries should be
// required here (e.g. pym.js), and it should also be
// responsible for instantiating correct viewcontrollers.
//



// Opens Hamburgler Menu
$(".icon").click(function () {
    $(".mobilenav").fadeToggle(250);
    $(".mobilenav li").toggleClass('slideInLeft');
    // Need slideOutLeft for closing menu
    $(".top-menu").toggleClass("top-animate");
    $(".mid-menu").toggleClass("mid-animate");
    $(".bottom-menu").toggleClass("bottom-animate");
});


