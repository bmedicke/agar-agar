var Interface = {
    
    swarmParticle : null,
    swarmSize : 0,
    
    draw : function( gl ) {
        
        if (this.swarmParticle) {
            
            gl.bindShader(gl.defaultShader);
            
            gl.setColor(0.5, 0.5, 1.0, 0.5);
            
            gl.drawCircle(this.swarmParticle.position.x, this.swarmParticle.position.y, this.swarmSize / 2);
            
            this.swarmParticle = null;
            
        }
        
    }
    
};