var Vectorfield = function(width, height) {
    
    this.cellSize = Math.sqrt(width * height / this.numberOfCells);
    this.cols = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(height / this.cellSize);
    
    this.boundaryOffset = {
        x : this.cols - width / this.cellSize,
        y : this.rows - height / this.cellSize
    };
    
    this.dynamicVectors = {};
    this.staticVectors = {};
    
};

Vectorfield.prototype = {
    
    numberOfCells : 2000,
    
    maxForce : 1,
    
    dampCoefficient : 0.0005,
    forceCoefficient : 0.005,
    
    minLength : 0.001,
    
    update : function(dt) {
        
        this.staticVectors = {};
        
        for (var cellID in this.dynamicVectors) {
            
            if (this.dynamicVectors.hasOwnProperty(cellID)) {
                
                this.dynamicVectors[cellID].mulSelf(1 - this.dampCoefficient * dt);
                
                if (this.dynamicVectors[cellID].normSquared() < this.minLength) {
                
                    delete this.dynamicVectors[cellID];
                
                }
                
            }
        }
        
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
        
        
        gl.setColor(0.8, 0.4, 0.4, 1.0);
        
        this.drawVectors(this.dynamicVectors);
        
        gl.setColor(0.4, 0.8, 0.4, 1.0);
        
        this.drawVectors(this.staticVectors);
        
    },
    
    reset : function() {
        
        this.dynamicVectors = {};
        
    },
    
    drawVectors : function(vectors) {
        
        var cell = new Vector(),
            vector = new Vector();
        
        for (var cellID in vectors) {
            
            if (vectors.hasOwnProperty(cellID)) {
                
                cell.set(cellID % this.cols + .5, Math.floor(cellID / this.cols) + .5, 0);
                vector = vectors[cellID].clamp(1.3);
            
                gl.drawLine(
                    cell.x, cell.y,
                    cell.x + vector.x, cell.y + vector.y
                );
                
            }
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
        
        return (this.dynamicVectors[cellID] || new Vector()).add(this.staticVectors[cellID] || new Vector());
        
    },
    
    setDynamicVector : function(cellID, vector) {
        
        this.dynamicVectors[cellID] = (this.dynamicVectors[cellID] || new Vector()).addSelf(vector).clamp(this.maxForce);
        
    },
    
    setStaticVector : function(cellID, vector) {
        
        this.staticVectors[cellID] = (this.staticVectors[cellID] || new Vector()).addSelf(vector);
        
    },
    
    applyForceField : function(dt, force, radius, position, isDynamic, angle, point) {
        
        point = point || position;
        angle = angle || 0;
                
        var cell = this.getCell(position),
            left = Math.floor(cell.x - radius < 0 ? 0 : cell.x - radius),
            right = Math.ceil(cell.x + radius > this.cols ? this.cols : cell.x + radius),
            top = Math.floor(cell.y - radius < 0 ? 0 : cell.y - radius),
            bottom = Math.ceil(cell.y + radius > this.rows ? this.rows : cell.y + radius),
            setVector = isDynamic ? this.setDynamicVector : this.setStaticVector,
            cellVector = new Vector();
        
        for (var i = left; i < right; i++) {
            
            for (var j = top; j < bottom; j++) {
                
                cellVector.set(i + .5, j + .5, 0);
                
                if (cellVector.sub(position).normSquared() < radius * radius) {
                    
                    var distance = cellVector.sub(position).norm();
                    cellVector.subSelf(point).normalizeSelf().mulSelf(-force * (1 - distance / radius) * dt).rotate2DSelf(angle);
                                        
                    setVector.call(this, i + j * this.cols, cellVector);
                    
                }
                
            }
            
        }
        
    }
    
};
