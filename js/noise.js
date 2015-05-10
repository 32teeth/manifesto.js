var noise = (function(){
	
	var canvas = document.getElementById("noise");
	var ctx = canvas.getContext('2d');
	var width;
	var height;
	var image;
	var buffer;
	var length;
	var fps = 60;
	var toggle = false;
	var opacity = 0.5

	var colors = [
		"#cdccce",
		"#fbfb05",
		"#05fbfb",
		"#06fa06",
		"#fb05fb",
		"#fb0505",
		"#0505fb",
		"#0505fb",
		"#0a0911",
		"#fb05fb",
		"#0a0911",
		"#05fbfb",
		"#0a0911",
		"#cdccce",
		"#0a0911",
		"#FFFFFF",
		"#0a0911",
		"#0a0911",
		"#0a0911",
		"#0a0911"
	]

	function init()
	{
		bind();
		resize();
	}

	function bind()
	{
		("resize".split(" ")).forEach(function(e)
		  {
		    window.addEventListener(e,noise.resize,false);
		  }
		);		
	}

	function resize(e)
	{
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';   
	}

	function draw()
	{
		width = canvas.width;
		height = canvas.height; 
				
		image = ctx.createImageData(width, height);
		buffer = new Uint32Array(image.data.buffer);
		length = buffer.length;
		var n = 0;

		for(; n < length;)
		{
			buffer[n++] = ((54 * Math.random())|0) << 24;
		}

		ctx.putImageData(image, 0, 0);

		opacity += Math.round(Math.random()) == 0 ? -0.01 : 0.01;
		if(opacity > 1){opacity = 1;}
		if(opacity < 0){opacity = 0.01;}

		for(var n = 0; n < 7; n++)
		{
			ctx.fillStyle = 'rgba(' + hexToRgb(colors[n]).r + ',' + hexToRgb(colors[n]).g + ',' + hexToRgb(colors[n]).b + ', ' + opacity + ')';
			ctx.fillRect((width*0.1428)*(n),0,width*0.1428,(height*0.6));
		}

		for(var n = 7; n < 14; n++)
		{
			ctx.fillStyle = 'rgba(' + hexToRgb(colors[n]).r + ',' + hexToRgb(colors[n]).g + ',' + hexToRgb(colors[n]).b + ', ' + opacity + ')';
			ctx.fillRect((width*0.1428)*(n-7),(height*0.6),width*0.1428,(height*0.15));
		}		

		for(var n = 14; n < 20; n++)
		{
			ctx.fillStyle = 'rgba(' + hexToRgb(colors[n]).r + ',' + hexToRgb(colors[n]).g + ',' + hexToRgb(colors[n]).b + ', ' + opacity + ')';
			ctx.fillRect((width*0.1666)*(n-14),(height*0.749),width*0.1666,(height));
		}				
	}

	function hexToRgb(hex) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	}	

	(function loop(){
		toggle = toggle ? false : true;
		if(toggle)
		{
			requestAnimationFrame(loop);
			return;
		}
		draw();
		requestAnimationFrame(loop);
	})();	

	/*
	** @return
	** @description exposed methods for noise
	*/	
	return {
	  init:function(){init();},
	  resize:function(e){resize(e);}
	}	

})();

noise.init();