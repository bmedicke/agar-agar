var Cytoplast = function(position) {
    
    Entity.call(this, position);
    this.currentFill = 0;
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 800000;
Cytoplast.prototype.entityRadius = 2.0;
Cytoplast.prototype.moveSpeed = 0;
Cytoplast.prototype.maxFill = 50;
