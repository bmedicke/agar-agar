var Entropyfier = function(position, chargeTime, entityRadius) {

    this.position = position;
    this.timer = 0;
    this.chargeTime = chargeTime || 0;
    this.entityRadius = entityRadius || 0;
    this.forceRadius = this.entityRadius * 2.5;

};

Entropyfier.initialize = function(gl) {
    
    this.shader = gl.loadShader("entropyfier-vertex-shader", "entropyfier-fragment-shader");

    gl.bindShader(this.shader);

    this.shader.positionAttribLocation = gl.getAttribLocation(this.shader, "position");

    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    this.shader.lifeTimeUniformLocation = gl.getUniformLocation(this.shader, "lifeTime");
    
};

Entropyfier.prototype = {
    
    entropyTime : 5000,
    entropyRadius : 5,
    forceTime : 1000,
    force : 100,

    update : function(dt) {

        this.timer += dt;

    },

    draw : function(gl) {

        // if (this.timer <= this.chargeTime) {
        //     
        //     gl.enableAlpha();
        //     gl.fill();
        // 
        //     gl.setColor(.9, .9, .9, Math.sqrt(this.timer / this.chargeTime));
        //     gl.drawCircle(this.position.x, this.position.y, Math.sqrt(this.timer / this.chargeTime) * this.entityRadius);
        // 
        //     gl.noFill();
        // 
        //     gl.setColor(.7, .7, .7, Math.sqrt(this.timer / this.chargeTime));
        //     gl.drawCircle(this.position.x, this.position.y, Math.sqrt(this.timer / this.chargeTime) * this.entityRadius);
        // 
        //     gl.disableAlpha();
        //     
        // }
        
        if (this.timer <= this.chargeTime) {
        
            gl.enableAlpha();
            gl.fill();
        
            gl.bindShader(Entropyfier.shader);
        
            gl.uniform1f(
                Entropyfier.shader.lifeTimeUniformLocation, 
                this.timer / this.chargeTime
            );
        
            gl.drawCircle(this.position.x, this.position.y, (Math.sqrt(this.timer / this.chargeTime) + 1) * this.entityRadius * 0.5);
        
            gl.disableAlpha();
            
        }
    
    }

};
