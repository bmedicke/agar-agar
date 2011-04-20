var Leukocyte = function(position) {

	Entity.call(this, position);
	
};

Leukocyte.prototype = new Entity();
Leukocyte.prototype.constructor = Entity;

Leukocyte.prototype.mass = 10;
Leukocyte.prototype.radius = 0.5;
Leukocyte.prototype.moveSpeed = 0.00001;

Leukocyte.prototype.draw = function(gl) {
    
    gl.fill();

    gl.setColor(0, 1, 1, 1);    
    gl.drawRect(this.position.x, this.position.y, this.radius, this.radius);

};
