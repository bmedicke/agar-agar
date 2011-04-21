var Vectorfield = function(width, height) {
    
    this.cellSize = Math.sqrt(width * height / this.numberOfCells);
    this.cols = Math.floor(width / this.cellSize);
    this.rows = Math.floor(height / this.cellSize);
    
    this.vectors = {};
    
};

Vectorfield.prototype = {
    
    numberOfCells : 1000,
    
    maxForce : 1,
    
    dampCoefficient : 0.001,
    forceCoefficient : 0.005,
    
    minLength : 0.001,
    
    update : function(dt) {
        
        for (var cellID in this.vectors) {
            
            if (this.vectors.hasOwnProperty(cellID)) {
                
                this.vectors[cellID].mulSelf(1 - this.dampCoefficient * dt);
                
                if (this.vectors[cellID].normSquared() < this.minLength) {
                
                    delete this.vectors[cellID];
                
                }
                
            }
        }
        
    },
    
    draw : function(gl) {
        
        gl.setColor(0.8, 0.8, 0.8, 1.0);
        
        for (var i = 1; i < this.cols; i++) {
            
            gl.drawLine(i, 0, i, this.rows);
            
        }
        
        for (var i = 1; i < this.rows; i++) {
            
            gl.drawLine(0, i, this.cols, i);
            
        }
        
        gl.setColor(0.8, 0.4, 0.4, 1.0);
        
        var cell = new Vector();
        
        for (var cellID in this.vectors) {
            
            if (this.vectors.hasOwnProperty(cellID)) {
                
                cell.set(cellID % this.cols + .5, Math.floor(cellID / this.cols) + .5, 0);
            
                gl.drawLine(
                    cell.x, cell.y,
                    cell.x + this.vectors[cellID].x, cell.y + this.vectors[cellID].y
                );
                
            }
        }
        
    },
    
    reset : function() {
        
        this.vectors = {};
        
    },
    
    getCell : function(position) {
        
        return {x: Math.floor(position.x), y: Math.floor(position.y)};
        
    },
    
    getCellID : function(position) {
        
        return Math.floor(position.y) * this.cols + Math.floor(position.x);
        
    },
    
    getVector : function(position) {
        
        return this.vectors[this.getCellID(position)] || new Vector();
        
    },
    
    setVector : function(cellID, vector) {
        
        this.vectors[cellID] = (this.vectors[cellID] || new Vector()).copy(vector).clamp(this.maxForce);
        
    },
    
    addVector : function(cellID, vector) {
        
        this.vectors[cellID] = (this.vectors[cellID] || new Vector()).addSelf(vector).clamp(this.maxForce);
        
    },
    
    applyForceField : function(dt, radius, position, setHard, point, angle) {
        
        point = point || 0;
        angle = angle || 0;
                
        var cell = this.getCell(position),
            left = cell.x - radius < 0 ? 0 : cell.x - radius,
            right = cell.x + radius > this.cols ? this.cols : cell.x + radius,
            top = cell.y - radius < 0 ? 0 : cell.y - radius,
            bottom = cell.y + radius > this.rows ? this.rows : cell.y + radius,
            cellVector = new Vector();
        
        for (var i = left; i < right; i++) {
            
            for (var j = top; j < bottom; j++) {
                
                cellVector.set(i + .5, j + .5, 0);
                
                if (cellVector.sub(position).normSquared() < radius * radius) {
                    
                    if (point) {
                        
                        var distance = cellVector.sub(position).normSquared();
                        cellVector.subSelf(point).divSelf(-distance);
                        
                    } else if (angle) {
                        
                        cellVector.subSelf(position).divSelf(-cellVector.normSquared()).rotate2DSelf(angle);
                        
                    } else {
                        
                        cellVector.subSelf(position).divSelf(-cellVector.normSquared());
                        
                    }
                    
                    if (setHard) {
                    
                        this.setVector(i + j * this.cols, cellVector);
                        
                    } else {
                        
                        this.addVector(i + j * this.cols, cellVector.mulSelf(this.forceCoefficient * dt));
                        
                    }
                    
                }
                
            }
            
        }
        
    }
    
};
