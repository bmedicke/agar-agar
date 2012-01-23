var Entropyfier = function(position, time, radius) {

    this.position = position;
    this.radius = radius;
    
    this.time = time;
    this.elapsed = 0;
    
    this.forcefield = new Forcefield(
        position,
        this.radius,
        this.force,
        false,
        Math.PI
    );

};

Entropyfier.prototype = {
    
    entropyTime : 8000,
    entropyRadius : 5,
    
    force : 25,
    lightForce : 2,
    
    update : function(dt) {

        this.elapsed += dt;

        var elapsedPercent = this.elapsed / this.time;
        
        if (elapsedPercent >= 1.0) {
            
            this.forcefield.radius = this.radius * 2.0;
            this.forcefield.force = this.force;
            
            game.vectorfield.addForcefield(this.forcefield);
            
            return false;
            
        } else if (elapsedPercent > 0.7) {
        
             this.forcefield.force = (elapsedPercent - 0.7) * this.lightForce;
        
             game.vectorfield.applyForcefield(dt, this.forcefield);

        }
        
        return true;

    }

};

Entropyfier.initialize = function(gl) {
    
    var shader = gl.loadShader("entropyfier-vertex-shader", "entropyfier-fragment-shader");

    gl.bindShader(shader);

    shader.positionAttribLocation = gl.getAttribLocation(shader, "position");

    shader.matrixUniformLocation = gl.getUniformLocation(shader, "matrix");
    shader.lifeTimeUniformLocation = gl.getUniformLocation(shader, "lifeTime");

    this.shader = shader;

};

Entropyfier.update = function(dt, entities) {
    
    for (var i = 0; i < entities.length; i++) {
        
        if (!entities[i].update(dt)) {
            
            entities.splice(i, 1);
            i--;
            
        }
        
    }
    
};

Entropyfier.draw = function(gl, entities) {
    
    gl.bindShader(Entropyfier.shader);
    
    for (var i = entities.length - 1; i >= 0; i--) {
        
        var entity = entities[i],
            elapsedPercent = entity.elapsed / entity.time * 0.65;
        
        gl.uniform1f(Entropyfier.shader.lifeTimeUniformLocation, elapsedPercent);
        
        gl.drawCircle(
            entity.position.x, 
            entity.position.y, 
            (Math.sqrt(elapsedPercent) + 1) * entity.radius * 0.5
        );
    
    }

};

Entropyfier.add = function(amount, entities) {

    for (var i = 0; i < amount; i++) {

        var center = game.controller.getRandomInsidePosition(),
            radius = this.prototype.entropyRadius * rand(0.75, 1.25),
            time = this.prototype.entropyTime * rand(0.75, 1.25),
            distance, angle, offset;

        entities.push(new Entropyfier(center.clone(), time, radius));
        
        if (Math.random() > 0.3) {
            
            distance = rand(1.5, 2) * radius;
            radius = (distance - radius) * rand(0.8, 0.95);
            time *= rand(0.9, 1.1);
            angle = rand(0, 2 * Math.PI);
        
            offset = new Vector(distance, 0).rotate2DSelf(angle);
        
            entities.push(new Entropyfier(center.add(offset), time, radius));
            
            if (Math.random() > 0.3) {
                
                radius *= rand(0.8, 0.9);
                time *= rand(0.9, 1.1);
                angle += rand( 0.2, 0.5) * Math.PI * randSign();
                
                offset.rotate2DSelf(angle).mulSelf(rand(0.9, 1.1));
                
                entities.push(new Entropyfier(center.add(offset), time, radius));
                
            }
            
        }
        
    }

};
