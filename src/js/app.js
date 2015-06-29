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


// Short script to encode SVG in base64
// This can be reversed using window.atob('base64')
var code = document.getElementById('code');
var demo = document.getElementById('demo');
var svg = document.getElementsByTagName('svg')[0];

// Convert the SVG node to HTML.
var div = document.createElement('div');
div.appendChild(svg.cloneNode(true));

// Encode the SVG as base64
var b64 = 'data:image/svg+xml;base64,'+window.btoa(div.innerHTML);
var url = 'url("' + b64 + '")';
code.innerHTML = 'Base64 CSS (for cross-browser compatibility)\n\nbackground-image: ' + url + ';';
demo.style.backgroundImage = url;


