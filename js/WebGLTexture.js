WebGLRenderingContext.prototype.loadTexture = function(imagePath) {
    
    var texture = this.createTexture();
    texture.image = new Image();
    
    var self = this;
    
    texture.image.onload = function () {
        
        self.textureImageLoaded(texture);
        
    }
    
    missingResourceCount++;
    texture.image.src = imagePath;
    
    return texture;
    
};

WebGLRenderingContext.prototype.textureImageLoaded = function(texture) {
        
    this.bindTexture( this.TEXTURE_2D, texture );

    this.pixelStorei( this.UNPACK_FLIP_Y_WEBGL, true );
    this.texImage2D( this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, texture.image );

    this.texParameteri( this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.NEAREST );
    this.texParameteri( this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.NEAREST );

    this.bindTexture( this.TEXTURE_2D, null );
    
    missingResourceCount--;
    start();
    
};