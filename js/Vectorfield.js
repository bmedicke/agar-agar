var Forcefield = function(position, radius, force, isDynamic, angle, point, duration) {
    
    this.position = position || new Vector();
    this.radius = radius || 0;
    this.force = force || 0;
    
    this.isDynamic = isDynamic || false;
    
    this.angle = angle || 0;
    this.point = point || position;
    this.duration = duration || 0;
    
};

var Vectorfield = function() {
    
    this.cellSize = null;
    this.cols = null;
    this.rows = null;
    
    this.boundaryOffset = null;
    
    this.dynamicVectors = [];
    this.staticVectors = [];
    
    this.dynamicLookupTable = [];
    this.staticLookupTable = [];
    
    this.forcefields = [];
    
};

Vectorfield.prototype = {
    
    numberOfCells : 3000,
    
    maxForce : 1.5,
    
    dampCoefficient : 0.0005,
    forceCoefficient : 0.005,
    
    minLength : 0.001,
    maxLength : 1.0,
    
    initSize : function(width, height) {
        
        this.cellSize = Math.sqrt(width * height / this.numberOfCells);
        this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);

        this.boundaryOffset = {
            x : this.cols - width / this.cellSize,
            y : this.rows - height / this.cellSize
        };
        
        return this.cellSize;
    
    },
    
    initialize : function(gl) {

        this.vertexBuffer = gl.createBuffer();
        this.vertexBuffer.itemSize = 4;
        this.vertexBuffer.vertexCount = 0;

        this.vertexArray = new Float32Array(this.cols * this.rows * this.vertexBuffer.itemSize);

        this.shader = gl.loadShader("vectorfield-vertex-shader", "vectorfield-fragment-shader");

        gl.bindShader(this.shader);

        this.shader.positionAttribLocation = gl.getAttribLocation(this.shader, "position");

        this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
        gl.passMatrix();

        var self = this;

        this.texture = gl.loadTexture("textures/vector.png", function(gl) {

            gl.bindShader(self.shader);
            gl.passTexture(self.texture, gl.getUniformLocation(self.shader, "texture"));

        });

        for (var i = 0; i < this.rows * this.cols; i++) {
        
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
        
        // gl.setColor(0.5, 1.0, 0.5, 1.0);
        // 
        // this.drawVectors(this.dynamicVectors, this.dynamicLookupTable);
        // 
        // gl.setColor(1.0, 0.5, 0.5, 1.0);
        // 
        // this.drawVectors(this.staticVectors, this.staticLookupTable);
        
        this.dynamicLookupTable.sort(function(a, b){return a - b;});
        this.staticLookupTable.sort(function(a, b){return a - b;});
        
        var i = 0,
            j = 0;
        
        while (i < this.dynamicLookupTable.length && j < this.staticLookupTable.length) {
            
            var dynCellID = this.dynamicLookupTable[i],
                statCellID = this.staticLookupTable[j];
            
            if (dynCellID === statCellID) {
                
                this.drawVector(dynCellID, this.staticVectors[statCellID].addSelf(this.dynamicVectors[dynCellID]));
                i++; j++;
                
            } else if (dynCellID < statCellID) {
                
                this.drawVector(dynCellID, this.dynamicVectors[dynCellID]);
                i++;
                
            } else {
                
                this.drawVector(statCellID, this.staticVectors[statCellID]);
                j++;
                
            }
        
        }
        
        while (i < this.dynamicLookupTable.length) {
        
            var cellID = this.dynamicLookupTable[i];
            this.drawVector(cellID, this.dynamicVectors[cellID]);
            i++;
        
        }
        
        while (j < this.staticLookupTable.length) {
        
            var cellID = this.staticLookupTable[j];
            this.drawVector(cellID, this.staticVectors[cellID]);
            j++;
        
        }
        
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
        
        gl.bindShader(this.shader);
        gl.enableAlpha();
        
        gl.passVertices(gl.POINTS, this.vertexBuffer);
        
        gl.disableAlpha();
        gl.bindShader(gl.defaultShader);
        
        this.vertexBuffer.vertexCount = 0;
        
    },
    
    drawVector : function(cellID, vector) {
        
        var i = this.vertexBuffer.vertexCount,
            l = vector.norm();
        
        this.vertexArray[i * 4] = cellID % this.cols + .5;
        this.vertexArray[i * 4 + 1] = Math.floor(cellID / this.cols) + .5;
        this.vertexArray[i * 4 + 2] = (l < this.maxLength ? l : this.maxLength) * this.cellSize;
        this.vertexArray[i * 4 + 3] = vector.angle();
        
        this.vertexBuffer.vertexCount++;
    },
    
    reset : function() {
        
        for(var i = 0; i < this.dynamicLookupTable.length; i++) {
            
            this.dynamicVectors[this.dynamicLookupTable[i]].set(0, 0, 0);
            
        }
        
        this.dynamicLookupTable = [];
        this.forcefields = [];
        
    },
    
    updateForcefields : function(dt) {
        
        for (var i = 0; i < this.forcefields.length; i++) {
            
            this.applyForcefield(dt, this.forcefields[i]);
            
            this.forcefields[i].force *= 0.95;
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
            
        if (!forcefield.isDynamic) {
            
            dt = 1;
            
        }
        
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
