var Cytoplast = function(position) {
    
    Entity.call(this, position);
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 1000000;
Cytoplast.prototype.entityRadius = 2.0;
Cytoplast.prototype.moveSpeed = 0.1;