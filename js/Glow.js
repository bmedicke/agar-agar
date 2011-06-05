var Glow = {
    
    textureSizeFactor : 2.5,
    
    initialize : function(gl) {

        this.shader = gl.loadShader("glow-vertex-shader", "glow-fragment-shader");

        gl.bindShader(this.shader);

        this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
        gl.passMatrix();

        var self = this;
    
        this.texture = gl.loadTexture("textures/glow.png", function(gl) {
        
            gl.bindShader(self.shader);
            gl.passTexture(self.texture, gl.getUniformLocation( self.shader, "texture" ));
        
        });
        
    },
    
    draw : function(gl, entities, glowRadius) {

        var size = glowRadius * 2 * this.textureSizeFactor;

        gl.bindShader(this.shader);
        gl.enableAlpha();
        
        for (var i = 0; i < entities.length; i++) {
            
            gl.pushMatrix();

            gl.translate(entities[i].position.x, entities[i].position.y);
            gl.scale(size, size);

            gl.passMatrix();
            gl.drawQuadTexture();

            gl.popMatrix();
            
        }

        gl.disableAlpha();

    }
    
};
