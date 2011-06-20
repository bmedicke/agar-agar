
var Vector = function(x, y, z) {

    return this.set(
        x || 0, 
        y || 0, 
        z || 0
    );

};

Vector.prototype = {
    
    set: function(x, y, z) {
        
        this.x = x;
        this.y = y;
        this.z = z;
        
        return this;
        
    },
    
    copy: function(vector) {
        
        return this.set(
            vector.x,
            vector.y,
            vector.z
        );
        
    },
    
    clone: function() {
        
        return new Vector(
            this.x, 
            this.y, 
            this.z
        );
        
    },

    add: function(vector) {

        return new Vector(
            this.x + vector.x, 
            this.y + vector.y,
            this.z + vector.z
        );

    },

    addSelf: function(vector) {

        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;

        return this;

    },
    
    sub: function(vector) {

        return new Vector(
            this.x - vector.x, 
            this.y - vector.y,
            this.z - vector.z
        );

    },

    subSelf: function(vector) {

        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;

        return this;

    },
    
    mul: function(value) {

        return new Vector(
            this.x * value, 
            this.y * value,
            this.z * value
        );

    },
    
    mulSelf: function(value) {

        this.x *= value;
        this.y *= value;
        this.z *= value;
            
        return this;

    },
    
    div: function(value) {
        
        if (!value) {
            
            return new Vector();
            
        }

        return new Vector(
            this.x / value, 
            this.y / value,
            this.z / value
        );

    },
    
    divSelf: function(value) {
        
        if (value) {
            
            this.x /= value;
            this.y /= value;
            this.z /= value;
            
        }
        
        return this;

    },
    
    dot: function(vector) {
        
        return (this.x * vector.x + this.y * vector.y + this.z * vector.z);
        
    },
    
    normSquared: function() {
        
        // return this.dot(this);
        
        return (this.x * this.x + this.y * this.y + this.z * this.z);
        
    },
    
    norm: function() {
        
        return Math.sqrt(this.normSquared());
        
    },
    
    normalize: function() {
        
        return this.div(this.norm());
        
    },
    
    normalizeSelf: function() {
        
        return this.divSelf(this.norm());
        
    },
    
    clamp: function(value) {
        
        if (this.normSquared() > value * value) {
            
            return this.normalize().mul(value);
            
        }
        
        return this;
        
    },
    
    clampSelf: function(value) {
        
        if (this.normSquared() > value * value) {
            
            return this.normalizeSelf().mulSelf(value);
            
        }
        
        return this;
        
    },
    
    cross: function(vector) {
        
        return new Vector(
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        );
        
    },
    
    crossSelf: function(vector) {
        
        this.set(
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        );
        
    },
    
    angle: function(vector) {
        
        if (vector) {
            
            return Math.acos(this.dot(vector) / this.norm() / vector.norm());
            
        } else {
            
            return Math.atan2(this.y, this.x);
            
        }
        
    },
    
    rotate2D: function(angle) {
        
        return this.clone().rotate2DSelf(angle);
        
    },
    
    rotate2DSelf: function(angle) {
        
        return this.set(
            Math.cos(angle) * this.x - Math.sin(angle) * this.y,
            Math.sin(angle) * this.x + Math.cos(angle) * this.y,
            this.z
        );
        
    }
};
