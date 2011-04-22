var DustParticle = function(position, velocity) {
    
    this.position = position;
    this.velocity = velocity;
    
    if (!velocity.normSquared()) {
    
        this.velocity = new Vector(
            (Math.random() * 2 - 1) / this.jitter, 
            (Math.random() * 2 - 1) / this.jitter, 
            0
        );
    
    }
    
    this.mass = Math.random() * DustParticle.prototype.mass + DustParticle.prototype.mass / 2;
    
    this.velocity.divSelf(this.mass);
    this.timer = Math.random() * DustParticle.prototype.lifeTime / 2;
    
};

DustParticle.prototype.lifeTime = 6000;
DustParticle.prototype.mass = 25;
DustParticle.prototype.jitter = 50;

DustParticle.prototype.update = function(dt) {
    
    this.timer += dt;
    
    this.velocity.divSelf(this.mass);
    this.position.addSelf(this.velocity);
    this.position.z = Math.sin(this.timer / this.lifeTime * Math.PI);

};

DustParticle.prototype.draw = function(gl) {

    gl.setColor(0.5, 0.5, 0.5, this.position.z);
    gl.drawCircle(this.position.x, this.position.y, 0.01);

};
