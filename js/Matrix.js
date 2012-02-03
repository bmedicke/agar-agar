
var Matrix = function(a, b, c) {
    
    this.a = a || new Vector(1, 0, 0);
    this.b = b || new Vector(0, 1, 0);
    this.c = c || new Vector(0, 0, 1);
    
    return this;
    
};

Matrix.prototype = {
    
    set: function(a, b, c) {
        
        this.a = a;
        this.b = b;
        this.c = c;
        
        return this;
        
    },
    
    copy: function(matrix) {
        
        this.a.copy(matrix.a);
        this.b.copy(matrix.b);
        this.c.copy(matrix.c);
        
        return this;
        
    },
    
    clone: function() {
        
        return new Matrix(
            this.a.clone(),
            this.b.clone(),
            this.c.clone()
        );
        
    },
    
    identity: function() {
        
        this.a.set(1, 0, 0);
        this.b.set(0, 1, 0);
        this.c.set(0, 0, 1);
        
        return this;
        
    },
    
    transpose: function() {
        
        return new Matrix(
            new Vector(this.a.x, this.b.x, this.c.x),
            new Vector(this.a.y, this.b.y, this.c.y),
            new Vector(this.a.z, this.b.z, this.c.z)
        );
        
    },
    
    transposeSelf: function() {
        
        var vector = new Vector(this.b.y, this.c.x, this.c.y);
        
        this.b.x = this.a.y;
        this.c.x = this.a.z;
        this.c.y = this.b.z;
        
        this.a.y = vector.x;
        this.a.z = vector.y;
        this.b.z = vector.z;
        
        return this;
        
    },
    
    mul: function(matrix) {
        
        matrix.transposeSelf();
        
        return new Matrix(
            new Vector(this.a.dot(matrix.a), this.a.dot(matrix.b), this.a.dot(matrix.c)),
            new Vector(this.b.dot(matrix.a), this.b.dot(matrix.b), this.b.dot(matrix.c)),
            new Vector(this.c.dot(matrix.a), this.c.dot(matrix.b), this.c.dot(matrix.c))
        );
        
    },
    
    mulSelf : function(matrix) {
        
        matrix.transposeSelf();
        
        return this.set(
            new Vector(this.a.dot(matrix.a), this.a.dot(matrix.b), this.a.dot(matrix.c)),
            new Vector(this.b.dot(matrix.a), this.b.dot(matrix.b), this.b.dot(matrix.c)),
            new Vector(this.c.dot(matrix.a), this.c.dot(matrix.b), this.c.dot(matrix.c))
        );
        
    },
    
    rotate2D : function(angle) {
        
        return this.clone().rotate2DSelf(angle);
        
    },
    
    rotate2DSelf : function(angle) {
        
        var vector1 = new Vector(Math.cos(angle), Math.sin(angle), 0),
            vector2 = new Vector(-Math.sin(angle), Math.cos(angle), 0);
        
        this.a.set(this.a.dot(vector1), this.a.dot(vector2), this.a.z);
        this.b.set(this.b.dot(vector1), this.b.dot(vector2), this.b.z);
        this.c.set(this.c.dot(vector1), this.c.dot(vector2), this.c.z);
        
        return this;
        
    },
    
    scale2D : function(x, y) {
        
        return this.clone().scale2DSelf(x, y);
        
    },
    
    scale2DSelf : function(x, y) {
        
        this.a.x *= x;
        this.a.y *= y;
        
        this.b.x *= x;
        this.b.y *= y;
        
        this.c.x *= x;
        this.c.y *= y;
        
        return this;
        
    },
    
    translate2D : function(x, y) {
        
        return this.clone().translate2DSelf(x, y);
        
    },
    
    translate2DSelf : function(x, y) {
        
        var vector = new Vector(x, y, 1);
        
        this.a.z = this.a.dot(vector);
        this.b.z = this.b.dot(vector);
        this.c.z = this.c.dot(vector);
        
        return this;
        
    },
    
    flatten4D : function() {
        
        return [
            this.a.x, this.b.x, this.c.x, 0,
            this.a.y, this.b.y, this.c.y, 0,
            this.a.z, this.b.z, this.c.z, 0,
            0, 0, 0, 1
        ];
        
    }
    
};