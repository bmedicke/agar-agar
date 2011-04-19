
var Matrix = function(a, b, c) {
    
    this.set(
        a || new Vector(1, 0, 0),
        b || new Vector(0, 1, 0),
        c || new Vector(0, 0, 1)
    );
    
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
        
        this.a.set(matrix.a.x, matrix.a.y, matrix.a.z);
        this.b.set(matrix.b.x, matrix.b.y, matrix.b.z);
        this.c.set(matrix.c.x, matrix.c.y, matrix.c.z);
        
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
        
        return this.set(
            new Vector(this.a.x, this.b.x, this.c.x),
            new Vector(this.a.y, this.b.y, this.c.y),
            new Vector(this.a.z, this.b.z, this.c.z)
        );
        
    },
    
    mul: function(matrix) {
        
        var t = matrix.transpose();
        
        return new Matrix(
            new Vector(this.a.dot(t.a), this.a.dot(t.b), this.a.dot(t.c)),
            new Vector(this.b.dot(t.a), this.b.dot(t.b), this.b.dot(t.c)),
            new Vector(this.c.dot(t.a), this.c.dot(t.b), this.c.dot(t.c))
        );
        
    },
    
    mulSelf: function(matrix) {
        
        var t = matrix.transpose();
        
        return this.set(
            new Vector(this.a.dot(t.a), this.a.dot(t.b), this.a.dot(t.c)),
            new Vector(this.b.dot(t.a), this.b.dot(t.b), this.b.dot(t.c)),
            new Vector(this.c.dot(t.a), this.c.dot(t.b), this.c.dot(t.c))
        );
        
    },
    
    rotate2D: function(angle) {
        
        return this.mul(new Matrix(
            new Vector(Math.cos(angle), -Math.sin(angle), 0),
            new Vector(Math.sin(angle), Math.cos(angle), 0),
            new Vector(0, 0, 1)
        ));
        
    },
    
    rotate2DSelf: function(angle) {
        
        return this.mulSelf(new Matrix(
            new Vector(Math.cos(angle), -Math.sin(angle), 0),
            new Vector(Math.sin(angle), Math.cos(angle), 0),
            new Vector(0, 0, 1)
        ));
        
    },
    
    scale2D: function(x, y) {
        
        return this.mul(new Matrix(
            new Vector(x, 0, 0),
            new Vector(0, y, 0),
            new Vector(0, 0, 1)
        ));
        
    },
    
    scale2DSelf: function(x, y) {
        
        return this.mulSelf(new Matrix(
            new Vector(x, 0, 0),
            new Vector(0, y, 0),
            new Vector(0, 0, 1)
        ));
        
    },
    
    translate2D: function(x, y) {
        
        return this.mul(new Matrix(
            new Vector(1, 0, x),
            new Vector(0, 1, y),
            new Vector(0, 0, 1)
        ));
        
    },
    
    translate2DSelf: function(x, y) {
        
        return this.mulSelf(new Matrix(
            new Vector(1, 0, x),
            new Vector(0, 1, y),
            new Vector(0, 0, 1)
        ));
        
    },
    
    flatten4D: function() {
        
        return [
            this.a.x, this.a.y, this.a.z, 0,
            this.b.x, this.b.y, this.b.z, 0,
            this.c.x, this.c.y, this.c.z, 0,
            0, 0, 0, 1
        ];
        
    }
    
};