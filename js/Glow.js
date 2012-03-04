var Glow = {
    
    textureSizeFactor : 1.5,
    color : [0.7, 0.9, 0.7, 1.0],
    
    initialize : function(gl) {
    
        this.texture = gl.loadTexture("textures/glow.png");
        
    },
    
    draw : function(gl, entities, glowRadius) {

        var size = glowRadius * 2 * this.textureSizeFactor;

        gl.bindShader(gl.textureShader);
        gl.passTexture(this.texture);
        gl.passColor(this.color);
        
        for (var i = 0; i < entities.length; i++) {
            
            gl.pushMatrix();

            gl.translate(entities[i].position.x, entities[i].position.y);
            gl.scale(size, size);

            gl.passMatrix();
            gl.drawQuadTexture();

            gl.popMatrix();
            
        }

    }
    
};
