var Forcefield = function(position, radius, force, isDynamic, angle, point, duration) {
    
    this.position = position || new Vector();
    this.radius = radius || 0;
    this.force = force || 0;
    
    this.isDynamic = isDynamic || false;
    
    this.angle = angle || 0;
    this.point = point || position;
    this.duration = duration || 0;
    
};

var Vectorfield = function(width, height) {
    
    this.cellSize = Math.sqrt(width * height / this.numberOfCells);
    this.cols = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(height / this.cellSize);
    
    this.boundaryOffset = {
        x : this.cols - width / this.cellSize,
        y : this.rows - height / this.cellSize
    };
    
    this.dynamicVectors = [];
    this.staticVectors = [];
    
    this.dynamicLookupTable = [];
    this.staticLookupTable = [];
    
    this.forcefields = [];
    
};

Vectorfield.prototype = {
    
    numberOfCells : 2000,
    
    maxForce : 1,
    
    dampCoefficient : 0.0005,
    forceCoefficient : 0.005,
    
    minLength : 0.001,
    
    initialize : function() {
    
        for(var i = 0; i < this.rows * this.cols; i++) {
        
            this.staticVectors[i] = new Vector();
            this.dynamicVectors[i] = new Vector();
            
        }
    
    },
    
    update : function(dt) {
        
        for(var i = 0; i < this.staticLookupTable.length; i++) {
        
            var cellID = this.staticLookupTable[i];
            
            this.staticVectors[cellID].set(0, 0, 0);
            
        }
        
        this.staticLookupTable = [];

        
        for (var i = 0; i < this.dynamicLookupTable.length; i++) {
            
            var cellID = this.dynamicLookupTable[i];

            this.dynamicVectors[cellID].mulSelf(1 - this.dampCoefficient * dt);
            
            if (this.dynamicVectors[cellID].normSquared() < this.minLength) {
            
                this.dynamicVectors[cellID].set(0, 0, 0);
                
                this.dynamicLookupTable.splice(i, 1);                
                i--;
            
            }

        }
        
        this.updateForcefields(dt);
        
    },
    
    draw : function(gl) {
        
        // gl.setColor(0.8, 0.8, 0.8, 1.0);
        // 
        // for (var i = 1; i < this.cols; i++) {
        //     
        //     gl.drawLine(i, 0, i, this.rows);
        //     
        // }
        // 
        // for (var i = 1; i < this.rows; i++) {
        //     
        //     gl.drawLine(0, i, this.cols, i);
        //     
        // }
        
        
        gl.setColor(0.4, 0.8, 0.4, 1.0);
        
        this.drawVectors(this.dynamicVectors, this.dynamicLookupTable);
        
        gl.setColor(0.4, 0.4, 0.8, 1.0);
        
        this.drawVectors(this.staticVectors, this.staticLookupTable);
        
    },
    
    reset : function() {
        
        for(var i = 0; i < this.dynamicLookupTable.length; i++) {
            
            var cellID = this.dynamicLookupTable[i];
            
            this.dynamicVectors[cellID].set(0, 0, 0);
            
        }
        
        this.dynamicLookupTable = [];
    },
    
    updateForcefields : function(dt) {
        
        for (var i = 0; i < this.forcefields.length; i++) {
            
            this.applyForcefield(dt, this.forcefields[i]);
            
            this.forcefields[i].duration -= dt;
            
            if (this.forcefields[i].duration <= 0) {
                
                delete this.forcefields.splice(i, 1)[0];
                i--;
                
            }
            
        }
        
    },
    
    drawVectors : function(vectors, lookupTable) {
        
        var cell = new Vector(),
            vector = new Vector();
        
        for (var i = 0; i < lookupTable.length; i++) {
        
            var cellID = lookupTable[i];
        
            cell.set(cellID % this.cols + .5, Math.floor(cellID / this.cols) + .5, 0);
            vector = vectors[cellID].clampSelf(1.3);
        
            gl.drawLine(
                cell.x, cell.y,
                cell.x + vector.x, cell.y + vector.y
            );

        }
        
    },
    
    getCell : function(position) {
        
        return {x: Math.floor(position.x), y: Math.floor(position.y)};
        
    },
    
    getCellID : function(position) {
        
        return Math.floor(position.y) * this.cols + Math.floor(position.x);
        
    },
    
    getVector : function(position) {
        
        var cellID = this.getCellID(position);
        
        if(cellID >= 0 && cellID < this.numberOfCells) {
        
            return this.dynamicVectors[cellID].add(this.staticVectors[cellID]);

        } else {
        
            return new Vector();
        
        }
        
    },
    
    setDynamicVector : function(cellID, vector) {
        
        this.dynamicVectors[cellID].addSelf(vector).clampSelf(this.maxForce);
        
        if(this.dynamicLookupTable.indexOf(cellID) == -1) {
        
            this.dynamicLookupTable.push(cellID);
        
        }
        
    },
    
    setStaticVector : function(cellID, vector) {
        
        this.staticVectors[cellID] = (this.staticVectors[cellID] || new Vector()).addSelf(vector);
        
        this.staticLookupTable.push(cellID);
        
    },
    
    addForcefield : function(forcefield) {
        
        this.forcefields.push(forcefield);
        
    },
    
    applyForcefield : function(dt, forcefield) {
                
        var cell = this.getCell(forcefield.position),
            left = Math.floor(cell.x - forcefield.radius < 0 ? 0 : cell.x - forcefield.radius),
            right = Math.ceil(cell.x + forcefield.radius > this.cols ? this.cols : cell.x + forcefield.radius),
            top = Math.floor(cell.y - forcefield.radius < 0 ? 0 : cell.y - forcefield.radius),
            bottom = Math.ceil(cell.y + forcefield.radius > this.rows ? this.rows : cell.y + forcefield.radius),
            setVector = forcefield.isDynamic ? this.setDynamicVector : this.setStaticVector,
            cellVector = new Vector();
        
        for (var i = left; i < right; i++) {
            
            for (var j = top; j < bottom; j++) {
                
                cellVector.set(i + .5, j + .5, 0);
                
                if (cellVector.sub(forcefield.position).normSquared() < forcefield.radius * forcefield.radius) {
                    
                    var distance = cellVector.sub(forcefield.position).norm();
                    cellVector.subSelf(forcefield.point).normalizeSelf().mulSelf(-forcefield.force * (1 - distance / forcefield.radius) * dt).rotate2DSelf(forcefield.angle);
                    
                    setVector.call(this, i + j * this.cols, cellVector);
                    
                }
                
            }
            
        }
        
    }
    
};
