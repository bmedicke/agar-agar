var Timeout = function(callback, duration) {
    
    this.callback = callback || null;
    this.duration = duration || 0;
    
    this.elapsed = 0;
    
    this.stopped = false;
    this.interval = false;
    
};

Timeout.prototype.stop = function() {
    
    this.stopped = true;
    
};

var Timer = {
    
    timeouts : [],
    
    update : function(dt) {
        
        for (var i = 0; i < this.timeouts.length; i++) {
            
            var timeout = this.timeouts[i];
            
            timeout.elapsed += dt;
            
            if (timeout.duration < timeout.elapsed) {
                
                timeout.callback();
                
                if (timeout.interval) {
                    
                    timeout.elapsed -= timeout.duration;
                    
                } else {
                    
                    timeout.stopped = true;
                    
                }
                
            }
            
            if (timeout.stopped) {
                
                this.timeouts.splice(i, 1);
                i--;
                
            }
            
        }
        
    },
    
    setTimeout : function(callback, duration) {
        
        var timeout = new Timeout(callback, duration);
        
        this.timeouts.push(timeout);
        
        return timeout;
        
    },
    
    setInterval : function(callback, duration) {
        
        var timeout = this.setTimeout(callback, duration);
        
        timeout.interval = true;
        
        return timeout;
        
    },
    
    reset : function() {
        
        this.timeouts = [];
        
    }
    
};