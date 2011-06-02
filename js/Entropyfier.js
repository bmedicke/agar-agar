var Entropyfier = function(position, chargeTime, entityRadius) {

    this.position = position;
    this.timer = 0;
    this.chargeTime = chargeTime || 0;
    this.entityRadius = entityRadius || 0;
    this.forceRadius = this.entityRadius * 2.5;

};

Entropyfier.prototype = {
    
    entropyTime : 3000,
    entropyRadius : 3,
    forceTime : 1000,
    force : 5,

    update : function(dt) {

        this.timer += dt;

    },

    draw : function(gl) {

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
    
    }

};
