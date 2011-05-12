var Animation = function(object, values, duration, callback) {
    
    this.object = object;
    this.values = values;
    
    this.duration = duration;
    this.callback = callback;
    
    this.steps = {};
    
    for (var key in values) {
        
        if (values.hasOwnProperty(key)) {
            
            this.steps[key] = (values[key] - object[key]) / duration;
            
        }
        
    }
    
};

Animation.prototype.update = function(dt) {
    
    this.duration -= dt;
    
    if (this.duration > 0) {
        
        for (var key in this.values) {
            
            if (this.values.hasOwnProperty(key)) {
                
                this.object[key] += this.steps[key] * dt;
            
            }
          
        }
        
        return true;
        
    } else {
        
        for (var key in this.values) {
            
            if (this.values.hasOwnProperty(key)) {
                
                this.object[key] = this.values[key];
            
            }
          
        }
        
        if (this.callback) {
            
            this.callback();
            
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
    
    animate : function(object, values, duration, callback) {
        
        this.animations.push(new Animation(object, values, duration, callback));
        
    }
    
};
