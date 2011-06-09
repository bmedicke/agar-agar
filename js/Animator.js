var Animation = function(params) {
    
    this.object = params.object || null;
    this.values = params.values || null;
    
    this.duration = params.duration || 0;
    this.callback = params.callback || null;
    
    this.fullDuration = this.duration;
    
    this.easing = params.easing || "linear";
    
    this.steps = {};
    
    this.stopped = false;
    
    for (var key in this.values) {
        
        if (this.values.hasOwnProperty(key)) {
            
            this.steps[key] = (this.values[key] - this.object[key]) / this.duration;
            
        }
        
    }
    
};

Animation.prototype = {

    update : function(dt) {
        
        if (this.stopped) {
            
            return false;
            
        }
    
        this.duration -= dt;
    
        if (this.duration > 0) {
        
            for (var key in this.steps) {
            
                if (this.steps.hasOwnProperty(key)) {
                
                    var step = this.steps[key] * dt;
                
                    if (this.easing === "easeOut") {
                    
                        step *= 0.5 + this.duration / this.fullDuration;
                    
                    } else if (this.easing === "easeIn") {
                    
                        step *= 1.5 - this.duration / this.fullDuration;
                    
                    }
                
                    this.object[key] += step;
            
                }
          
            }
        
            return true;
        
        } else {
        
            if (this.callback) {
            
                this.callback.call(this.object);
            
            }
        
            return false;
        
        }
    
    },
    
    stop : function() {
        
        this.stopped = true;
        
    }
    
};


var Animator = {
    
    animations : [],
    
    update : function(dt) {
        
        for (var i = 0; i < this.animations.length; i++) {
            
            if (!this.animations[i].update(dt)) {
                
                delete this.animations.splice(i, 1)[0];
                
            }
            
        }
        
    },
    
    animate : function(params) {
        
        var animation = new Animation(params);
        
        this.animations.push(animation);
        
        return animation;
        
    },
    
    reset : function() {
        
        this.animations = [];
        
    }
    
};
