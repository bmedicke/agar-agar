
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
    
};

function rand( min, max ) {
    
    min = min || 0;
    max = max || 1;
    
    return Math.random() * (max - min) + min;
    
};

function randSign() {
    
    return Math.random() > 0.5 ? 1 : -1;
    
};

function randBool() {
    
    return Math.random() > 0.5;
    
};
