var DustParticle = function(position) {
    
    this.position = position || new Vector();
    
    this.timer = Math.random() * this.lifeTime;
    this.mass = Math.random() * this.baseMass + this.baseMass / 2;
    
};

DustParticle.prototype.lifeTime = 3000;
DustParticle.prototype.baseMass = 10;


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
            
            this.dustParticles.push(new DustParticle(position));
            
            vertices.push(position.x, position.y, position.z);
            
        }
        
        this.vertexArray = new Float32Array(vertices);

        this.dustShader = gl.loadShader("stardust-vertex-shader", "stardust-fragment-shader");

        gl.bindShader(this.dustShader);
        
        this.dustShader.positionAttribLocation = gl.getAttribLocation(this.dustShader, "position");
        this.dustShader.matrixUniformLocation = gl.getUniformLocation(this.dustShader, "matrix");
        
        gl.passMatrix();
    
    },
    
    update : function(dt) {
        
        for (var i = 0; i < this.maxParticles; i++) {
            
            var particle = this.dustParticles[i];
            
            if (particle.timer > particle.lifeTime) {
            
                particle.position.set(
                    Math.random() * this.vectorfield.cols, 
                    Math.random() * this.vectorfield.rows
                );
                
                particle.timer = 0;
            
            }
            
            particle.timer += dt;
            particle.position.addSelf(this.vectorfield.getVector(particle.position).divSelf(particle.mass));
            
            this.vertexArray[i * 3] = particle.position.x;
            this.vertexArray[i * 3 + 1] = particle.position.y;
            this.vertexArray[i * 3 + 2] = Math.cos(particle.timer / particle.lifeTime * Math.PI * 2) * -0.5 + 0.5;
        
        }

    },

    draw : function(gl) {
        
        gl.bindShader(this.dustShader);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
        
        gl.passVertices(gl.POINTS, this.vertexBuffer);
    
    }

};
