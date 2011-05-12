var Cytoplast = function(position) {
    
    Entity.call(this, position);
    this.currentFill = 0;
    
    this.dockedParticles = [];
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 800000;
Cytoplast.prototype.entityRadius = 2;
Cytoplast.prototype.moveSpeed = 0;
Cytoplast.prototype.maxFill = 30;
Cytoplast.prototype.dockedParticleSpeed = 0.01;

Cytoplast.prototype.update = function(dt) {

    var positionChange = Entity.prototype.update.call(this, dt);
    
    for(var i = 0; i < this.dockedParticles.length; i++) {
        
        var particleTarget = this.dockedParticles[i].target.add(this.position),
            particlePosition = this.dockedParticles[i].position;
        
        particlePosition.addSelf(positionChange);
        particlePosition.addSelf(particleTarget.sub(particlePosition).normalizeSelf().mulSelf(this.dockedParticleSpeed));
    
    }

};

Cytoplast.prototype.draw = function(gl) {
    
    gl.fill();
    gl.enableAlpha();
    
    
    gl.setColor(0.9, 1.0, .9, Math.sqrt(this.currentFill / this.maxFill));
    Entity.prototype.draw.call(this, gl);
    
    
    gl.disableAlpha();
    gl.noFill();
    
    
    gl.setColor(.7, .7, .5, 1);
    Entity.prototype.draw.call(this, gl);
    
    Particle.draw(gl, this.dockedParticles);

};

Cytoplast.prototype.isFull = function() {

    if(this.currentFill >= this.maxFill) {
    
        return true;
    
    } else {
    
        return false;
    
    }

};

Cytoplast.prototype.dockParticle = function(position) {
    
    var newParticle = new Particle(new Vector(position.x, position.y, 0)),
        randomInsideVector = new Vector(1, 0, 0);
    
    randomInsideVector.rotate2DSelf(Math.random() * Math.PI * 2);
    
    randomInsideVector.mulSelf(Math.random() * (this.entityRadius - Particle.prototype.entityRadius));
    
    newParticle.target = randomInsideVector;
    
    this.dockedParticles.push(newParticle);
    
};
