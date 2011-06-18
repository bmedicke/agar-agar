var DustParticle = function(position) {
    
    this.position = position || new Vector();
    this.timer = Math.random() * DustParticle.prototype.lifeTime;
    
    this.mass = Math.random() * DustParticle.prototype.mass + DustParticle.prototype.mass / 2;
    
};

DustParticle.prototype.lifeTime = 3000;
DustParticle.prototype.mass = 10;
