var Entropyfier = function(position) {

    this.position = position;
    this.timer = 0;

};

Entropyfier.prototype.chargeTime = 7000;
Entropyfier.prototype.forceTime = 2000;
Entropyfier.prototype.force = 1;
Entropyfier.prototype.forceRadius = 7;
Entropyfier.prototype.entityRadius = 2.5;

Entropyfier.prototype.update = function(dt) {
    
    this.timer += dt;

};

Entropyfier.prototype.draw = function(gl) {

    if (this.timer <= this.chargeTime) {
    
        gl.enableAlpha();
        gl.fill();
        
        gl.setColor(.9, .9, .9, Math.sqrt(this.timer / this.chargeTime));
        gl.drawCircle(this.position.x, this.position.y, Math.sqrt(this.timer / this.chargeTime) * this.entityRadius);
        
        gl.noFill();
        
        gl.setColor(.7, .7, .7, Math.sqrt(this.timer / this.chargeTime));
        gl.drawCircle(this.position.x, this.position.y, Math.sqrt(this.timer / this.chargeTime) * this.entityRadius);
        
        gl.disableAlpha();
    
    }

};
