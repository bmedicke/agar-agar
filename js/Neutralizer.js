var Neutralizer = function() {

	Entity.call(this);
	
};

Neutralizer.prototype = new Entity();
Neutralizer.prototype.constructor = Entity;

Neutralizer.prototype.mass = 10;
Neutralizer.prototype.radius = 0.5;
