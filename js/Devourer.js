var Devourer = function(position) {

	Entity.call(this, position);
	this.orientation.set(1, 0, 0);
	
};

Devourer.prototype = new Entity();
Devourer.prototype.constructor = Entity;

Devourer.prototype.mass = 2000000;
Devourer.prototype.entityRadius = 2.0;
Devourer.prototype.moveSpeed = 0.2;

Devourer.prototype.force = 0.1;
Devourer.prototype.forceRadius = 8.0;
Devourer.prototype.forceAngle = - Math.PI / 6;

Devourer.prototype.rotateSpeed = 0.0005;

Devourer.prototype.draw = function(gl) {
    
    gl.pushMatrix();
        
        gl.translate(this.position.x, this.position.y);
        
        gl.setColor(.5, .5, .7, 1);
        
        gl.drawCircle(0, 0, this.entityRadius);
        
        var angle = this.orientation.angle();
        gl.rotate(this.orientation.y < 0 ? -angle : angle);
        
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
        gl.rotate(Math.PI * 2 / 3);
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
        gl.rotate(Math.PI * 2 / 3);
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
    gl.popMatrix();

};

Devourer.prototype.update = function(dt) {
    
    Entity.prototype.update.call(this, dt);
    
    this.orientation.rotate2DSelf(this.rotateSpeed * dt);
    
};