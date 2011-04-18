
var Vector = function(x, y) {

    return this.set(x, y);

};

Vector.prototype = {
    
    set: function(x, y) {
        
        this.x = (typeof x !== 'undefined' ? x : 0);
        this.y = (typeof y !== 'undefined' ? y : 0);
        
        return this;
        
    },
    
    copyFrom: function(vector) {
        
        this.x = vector.x;
        this.y = vector.y;
        
        return this;
        
    },

    add: function(vector) {

        return new Vector(
            this.x + vector.x, 
            this.y + vector.y
        );

    },

    addSelf: function(vector) {

        this.x + vector.x;
        this.y + vector.y;

        return this;

    },
    
    sub: function(b) {

        return new Vector(
            this.x - vector.x, 
            this.y - vector.y
        );

    },

    subSelf: function(vector) {

        this.x - vector.x;
        this.y - vector.y;

        return this;

    },
    
    mul: function(value) {

        return new Vector(
            this.x * value, 
            this.y * value
        );

    },
    
    mulSelf: function(value) {

        this.x * value;
        this.y * value;
            
        return this;

    },
    
    div: function(value) {
        
        if (!value) {
            
            return this;
            
        }

        return new Vector(
            this.x / value, 
            this.y / value
        );

    },
    
    divSelf: function(value) {
        
        if (!value) {
            
            return this;
            
        }

        this.x / value;
        this.y / value;

        return this;

    },
    
    dot: function(vector) {
        
        return (this.x * vector.x + this.y * vector.y);
        
    },
    
    normSquared: function() {
        
        return this.dot(this);
        
    },
    
    norm: function() {
        
        return Math.sqrt(this.normSquared());
        
    },
    
    normalize: function() {
        
        return this.div(this.norm());
        
    },
    
    rotate = function(angle) {
    
        return new Vector(
            Math.cos(angle) * this.x - Math.sin(angle) * this.y,
            Math.sin(angle) * this.x + Math.cos(angle) * this.y
        );
        
    },
    
    rotateSelf = function(angle) {
    
        var vector = new Vector(
            Math.cos(angle) * this.x - Math.sin(angle) * this.y,
            Math.sin(angle) * this.x + Math.cos(angle) * this.y
        );
        
        this.copyFrom(vector);
        
        delete vector;
        
        return this;
        
    }
};
