var Stardust = function(vectorfield) {
    
    this.vectorfield = vectorfield;
    
    this.dustParticles = [];
    
    this.dustShader = null;
    
};

Stardust.prototype = {
    
    maxParticles : 1000,
    
    initialize : function(gl) {
        
        this.vertexBuffer = gl.createBuffer();
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.vertexCount = this.maxParticles;
        
        var vertices = [];
        
        for (var i = 0; i < this.maxParticles; i++) {
            
            var position = new Vector(
                Math.random() * this.vectorfield.cols, 
                Math.random() * this.vectorfield.rows
            );
            
            this.dustParticles.push(new DustParticle(
                position, 
                this.vectorfield.getVector(position),
                Math.random() * DustParticle.prototype.lifeTime
            ));
            
            vertices.push(position.x);
            vertices.push(position.y);
            vertices.push(position.z);
            
        }
        
        this.vertexArray = new Float32Array(vertices);

        this.dustShader = gl.loadShader("stardust-vertex-shader", "stardust-fragment-shader");
        
        this.dustShader.positionAttribLocation = gl.getAttribLocation(this.dustShader, "position");
        
        gl.bindShader(this.dustShader);
        
        this.dustShader.matrixUniformLocation = gl.getUniformLocation(this.dustShader, "matrix");
        gl.passMatrix();
    
    },
    
    update : function(dt) {
        
        for (var i = 0; i < this.maxParticles; i++) {
            
            var particle = this.dustParticles[i];
            
            if (particle.timer > DustParticle.prototype.lifeTime) {
            
                particle.position = new Vector(
                    Math.random() * this.vectorfield.cols, 
                    Math.random() * this.vectorfield.rows
                );
                
                particle.timer = 0;
            
            }
            
            particle.velocity = this.vectorfield.getVector(particle.position);
            particle.update(dt);
            
            this.vertexArray[i * 3] = particle.position.x;
            this.vertexArray[i * 3 + 1] = particle.position.y;
            this.vertexArray[i * 3 + 2] = particle.position.z;
        
        }

    },

    draw : function(gl) {
        
        gl.bindShader(this.dustShader);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
        
        gl.passVertices(gl.POINTS, this.vertexBuffer);
    
    }

};
