
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

function checkAngle( angle ) {
    
    if ( angle > Math.PI ) {
        
        angle -= 2 * Math.PI;
        
    } else if ( angle <= -Math.PI ) {
        
        angle += 2 * Math.PI;
        
    }
    
    return angle;
}
