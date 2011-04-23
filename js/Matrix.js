
var Matrix = function(a, b, c) {
    
    this.a = a || new Vector(1, 0, 0);
    this.b = b || new Vector(0, 1, 0);
    this.c = c || new Vector(0, 0, 1);
    
    return this;
    
};

Matrix.prototype = {
    
    set: function(a, b, c) {
        
        this.destroy();
        
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
    
    destroy : function() {
        
        delete this.a;
        delete this.b;
        delete this.c;
        
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
    
    transform : function(matrix) {
        
        var result = this.mul(matrix);
        
        delete matrix.destroy();
        
        return result;
        
    },
    
    transformSelf : function (matrix) {
        
        this.mulSelf(matrix);
        
        delete matrix.destroy();
        
        return this;
        
    },
    
    rotate2D : function(angle) {
        
        return this.transform(this.getRotate2DMatrix(angle));
        
    },
    
    rotate2DSelf : function(angle) {
        
        return this.transformSelf(this.getRotate2DMatrix(angle));
        
    },
    
    getRotate2DMatrix : function(angle) {
        
        return new Matrix(
            new Vector(Math.cos(angle), -Math.sin(angle), 0),
            new Vector(Math.sin(angle), Math.cos(angle), 0),
            new Vector(0, 0, 1)
        );
        
    },
    
    scale2D : function(x, y) {
        
        return this.transform(this.getScale2DMatrix(x, y));
        
    },
    
    scale2DSelf : function(x, y) {
        
        return this.transformSelf(this.getScale2DMatrix(x, y));
        
    },
    
    getScale2DMatrix : function(x, y) {
        
        return new Matrix(
            new Vector(x, 0, 0),
            new Vector(0, y, 0),
            new Vector(0, 0, 1)
        );
        
    },
    
    translate2D : function(x, y) {
        
        return this.transform(this.getTranslate2DMatrix(x, y));
        
    },
    
    translate2DSelf : function(x, y) {
        
        return this.transformSelf(this.getTranslate2DMatrix(x, y));
        
    },
    
    getTranslate2DMatrix : function(x, y) {
        
        return new Matrix(
            new Vector(1, 0, x),
            new Vector(0, 1, y),
            new Vector(0, 0, 1)
        );
        
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