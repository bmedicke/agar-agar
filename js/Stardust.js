var Stardust = function(vectorfield) {
    
    this.vectorfield = vectorfield;
    
    this.dustParticles = [];
    
    this.dustShader = null;
    
};

Stardust.prototype = {
    
    maxParticles : 10000,
    
    init : function(gl) {

        this.dustShader = new Shader(gl, "stardust-vertex-shader", "stardust-fragment-shader");
        this.dustBuffer = gl.createBuffer();
        
        gl.defaultShader.bind(gl);
    
    },
    
    update : function(dt) {
        
        for (var i = 0; i < this.dustParticles.length; i++) {
        
            this.dustParticles[i].velocity.copy(this.vectorfield.getVector(this.dustParticles[i].position));
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
        
        this.dustShader.bind(gl);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dustBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var positionAttribLocation = 0;
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.uniformMatrix4fv(
            this.dustShader.matrixUniformLocation, 
            false, 
            new Float32Array(gl.matrix.transpose().flatten4D())
        );
        
        gl.drawArrays(gl.POINTS, 0, this.dustParticles.length);
        
        gl.defaultShader.bind(gl);

        // for (var i = 0; i < this.dustParticles.length; i++) {
        //  
        //     this.dustParticles[i].draw(gl);
        //     
        // }
    
    }

};
