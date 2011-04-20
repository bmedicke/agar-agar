var Leukocyte = function(position) {

	Entity.call(this, position);
	
};

Leukocyte.prototype = new Entity();
Leukocyte.prototype.constructor = Entity;

Leukocyte.prototype.mass = 900000;
Leukocyte.prototype.entityRadius = 1.0;
Leukocyte.prototype.moveSpeed = 1;

Leukocyte.prototype.draw = function(gl) {
    
    gl.pushMatrix();
        
        gl.translate(this.position.x, this.position.y);
        var angle = this.orientation.angle();
        
        gl.rotate(this.orientation.y < 0 ? -angle : angle);
        
        gl.setColor(0, 1, 1, 1);
        gl.drawCircle(0, 0, this.entityRadius);
        
        gl.setColor(1, 1, 0, 1);
        gl.drawCircle(this.entityRadius, 0, this.entityRadius / 4);
        
    gl.popMatrix();

};
