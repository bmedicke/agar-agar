var Cytoplast = function(position) {
    
    Entity.call(this, position);
    this.currentFill = 0;
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 800000;
Cytoplast.prototype.entityRadius = 1.3;
Cytoplast.prototype.moveSpeed = 0;
Cytoplast.prototype.maxFill = 50;

Cytoplast.prototype.draw = function(gl) {

    
    gl.fill();
    gl.enableAlpha();
    
    
    gl.setColor(0.9, 1.0, .9, this.currentFill / (this.maxFill * 1.1));
    Entity.prototype.draw.call(this, gl);
    
    
    gl.disableAlpha();
    gl.noFill();
    
    
    gl.setColor(.7, .7, .5, 1);
    Entity.prototype.draw.call(this, gl);

};
