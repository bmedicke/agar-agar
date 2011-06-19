
function log() {
    
    console.log.apply(console, arguments);
    
};


function bind(scope, fn) {
    
    return function() {
        
        fn.apply(scope, arguments);
        
    };
    
};

function extend(destination, source) {
    
    for (var key in source) {
        
        if (source.hasOwnProperty(key)) {
            
            destination[key] = source[key];
            
        }
        
    }
    
    return destination;
};


/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if ( !window.requestAnimationFrame ) {

    window.requestAnimationFrame = ( function() {

    return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

            window.setTimeout( callback, 1000 / 60 );

        };

    } )();

}