var Stardust = function(position, velocity) {
    
    this.position = position || new Vector();
    
    this.velocity = velocity;
    
    if(!velocity.normSquared()) {
    
        this.velocity = new Vector(Math.random(), Math.random());
    
    }
    
    this.velocity.divSelf(this.mass);
    
    this.timer = Math.random() * 1000;
    
};

Stardust.prototype.lifeTime = 2000;
Stardust.prototype.mass = 100000;

Stardust.prototype.update = function(dt) {

    this.timer += dt;
    
    this.position.z = Math.sin(this.timer / this.lifeTime * Math.PI);
    
    this.position.addSelf(this.velocity);

};

Stardust.prototype.draw = function(gl) {

    gl.setColor(0, 0, 0, this.position.z);
    gl.drawCircle(this.position.x, this.position.y, 0.05);

};
