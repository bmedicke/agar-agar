var Neutralizer = function(position) {

	Entity.call(this, position);
	
};

Neutralizer.prototype = new Entity();
Neutralizer.prototype.constructor = Entity;

Neutralizer.prototype.mass = 10;
Neutralizer.prototype.radius = 0.5;
