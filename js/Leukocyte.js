var Leukocyte = function(position) {

	Entity.call(this, position);
	
};

Leukocyte.prototype = new Entity();
Leukocyte.prototype.constructor = Entity;

Leukocyte.prototype.mass = 300000;
Leukocyte.prototype.entityRadius = 0.5;
Leukocyte.prototype.moveSpeed = .3;

Leukocyte.prototype.draw = function(gl) {
    
    gl.pushMatrix();
    
        gl.translate(this.position.x, this.position.y);
        var angle = this.orientation.angle();
        
        gl.rotate(this.orientation.y < 0 ? -angle : angle);
        
        gl.setColor(.5, .8, .8, 1);
        gl.drawCircle(0, 0, this.entityRadius);
        
        gl.setColor(.6, .6, .6, 1);
        
        gl.rotate(Math.PI / 4);
        gl.drawCircle(this.entityRadius / 2, 0, this.entityRadius / 4);
        
        gl.rotate(-Math.PI / 2);
        gl.drawCircle(this.entityRadius / 2, 0, this.entityRadius / 4);
        
    gl.popMatrix();

};
