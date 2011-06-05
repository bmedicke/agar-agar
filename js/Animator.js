var Animation = function(params) {
    
    this.object = params.object || null;
    this.values = params.values || null;
    
    this.duration = params.duration || 0;
    this.callback = params.callback || null;
    
    this.fullDuration = this.duration;
    
    this.easing = params.easing || "linear";
    
    this.steps = {};
    
    for (var key in this.values) {
        
        if (this.values.hasOwnProperty(key)) {
            
            this.steps[key] = (this.values[key] - this.object[key]) / this.duration;
            
        }
        
    }
    
};

Animation.prototype.update = function(dt) {
    
    this.duration -= dt;
    
    if (this.duration > 0) {
        
        for (var key in this.steps) {
            
            if (this.steps.hasOwnProperty(key)) {
                
                var step = this.steps[key] * dt;
                
                if (this.easing === "easeOut") {
                    
                    step *= 0.5 + this.duration / this.fullDuration;
                    
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
        
        this.animations.push(new Animation(params));
        
    },
    
    reset : function() {
        
        this.animations = [];
        
    }
    
};
