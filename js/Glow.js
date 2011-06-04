var Glow = {
    
    maxCount : 200,
    textureSizeFactor : 2.5,
    
    initialize : function(gl) {
    
        this.vertexBuffer = gl.createBuffer();
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.vertexCount = 0;

        this.vertexArray = new Float32Array(this.maxCount * this.vertexBuffer.itemSize);

        this.shader = gl.loadShader("glow-vertex-shader", "glow-fragment-shader");

        gl.bindShader(this.shader);

        this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
        gl.passMatrix();

        var self = this;
    
        this.texture = gl.loadTexture("textures/glow.png", function(gl) {
        
            gl.bindShader(self.shader);
            gl.passTexture(self.texture);
        
        });
    
        gl.uniform1f(
            gl.getUniformLocation(this.shader, "size"), 
            game.vectorfield.cellSize * 2 * this.textureSizeFactor
        );
        
    },
    
    drawEnqueue : function(entities) {

        for (i = 0; i < entities.length; i++) {

            var index = (this.vertexBuffer.vertexCount + i) * 3;

            this.vertexArray[index] = entities[i].position.x;
            this.vertexArray[index + 1] = entities[i].position.y;
            this.vertexArray[index + 2] = entities[i].glowRadius;

        }

        this.vertexBuffer.vertexCount += entities.length;

    },
    
    draw : function(gl) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);

        gl.bindShader(this.shader);
        gl.enableAlpha();

        gl.passVertices(gl.POINTS, this.vertexBuffer);

        gl.disableAlpha();
        gl.bindShader(gl.defaultShader);

        this.vertexBuffer.vertexCount = 0;

    }
    
};
