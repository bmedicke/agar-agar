var Stardust = function(vectorfield) {
    
    this.vectorfield = vectorfield;
    
    this.dustParticles = [];
    
    this.dustShader = null;
    
};

Stardust.prototype = {
    
    maxParticles : 2000,
    
    initialize : function(gl) {

        this.dustShader = gl.loadShader("stardust-vertex-shader", "stardust-fragment-shader");
        
        this.dustBuffer = gl.createBuffer();
        this.dustBuffer.itemSize = 3;
        
        gl.bindShader(this.dustShader);
        
        this.dustShader.matrixUniformLocation = gl.getUniformLocation(this.dustShader, "matrix");
        gl.passMatrix();
        
        gl.bindShader(gl.defaultShader);
    
    },
    
    update : function(dt) {
        
        for (var i = 0; i < this.dustParticles.length; i++) {
        
            this.dustParticles[i].velocity = this.vectorfield.getVector(this.dustParticles[i].position);
            this.dustParticles[i].update(dt);
            
            if (this.dustParticles[i].timer > DustParticle.prototype.lifeTime) {
            
                this.dustParticles.splice(i, 1);
            
            }
        
        }
        
        for (var i = this.dustParticles.length; i < this.maxParticles; i++) {
        
            var position = new Vector(
                Math.random() * this.vectorfield.cols, 
                Math.random() * this.vectorfield.rows
            );
            
            this.dustParticles.push(new DustParticle(position, this.vectorfield.getVector(position)));
        
        }

    },

    draw : function(gl) {
        
        var vertices = [];
        
        for (var i = 0; i < this.dustParticles.length; i++) {

            vertices.push(
                this.dustParticles[i].position.x,
                this.dustParticles[i].position.y,
                this.dustParticles[i].position.z
            );

        }
        
        gl.bindShader(this.dustShader);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dustBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        
        this.dustBuffer.vertexCount = this.dustParticles.length;
        gl.passVertices(gl.POINTS, this.dustBuffer);
        
        gl.bindShader(gl.defaultShader);
    
    }

};
