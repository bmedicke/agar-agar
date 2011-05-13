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

Cytoplast.prototype.infectionTime = 1000;

Cytoplast.prototype.update = function(dt) {

    var positionChange = Entity.prototype.update.call(this, dt);
    
    for (var i = 0; i < this.dockedParticles.length; i++) {
        
        this.dockedParticles[i].position.addSelf(positionChange);
    
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

    return (this.currentFill >= this.maxFill);

};

Cytoplast.prototype.dockParticle = function(particlePosition) {
    
    var particle = new Particle(particlePosition.getCopy()),
        target = new Vector(1, 0, 0);
    
    target.rotate2DSelf(Math.random() * Math.PI * 2);
    target.mulSelf(Math.random() * (this.entityRadius - particle.entityRadius));
    target.addSelf(this.position);
    
    Animator.animate(
        particle.position, 
        {"x" : target.x, "y" : target.y}, 
        target.sub(particlePosition).norm() * Cytoplast.prototype.infectionTime
    );
    
    this.dockedParticles.push(particle);
    this.currentFill++;
    
    delete target;
    
};
