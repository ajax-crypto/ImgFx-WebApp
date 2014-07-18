var ImgFx = (function() {
	
	var tool_list = Object.freeze(
	{
		NOT : 0,
		PENCIL : 1,
		POLYGON : 2,
		FILL : 3
	});
	var current_tool = tool_list.NOT;
	
	var upload = document.createElement('input');
	var canvas = document.getElementById('drawing-canvas');
	var workarea = document.getElementById('work-area');
	var context = canvas.getContext('2d');
	var img = document.createElement('img');
	var tools = document.getElementsByClassName('tool-container');
	var layers = [];
	
	var tool_events = new Array(tools.length);
	try {
		tool_events[tool_list.NOT] = { remove : function() { } };
		
		tool_events[tool_list.PENCIL] = (function() { 
			var set = false;
			
			var prev_point = { x : 0, y : 0 };
	
			var event_handlers = [
			{
				name : 'mousemove',
				handler : function (evt) {
					if(down) {
						var pos = get_location(evt);
						pos.x += 5;
						pos.y += 35;
						context.beginPath();
						context.moveTo(prev_point.x, prev_point.y);
						context.lineTo(pos.x, pos.y);
						context.closePath();
						context.stroke();
						prev_point = pos;
					}
				}
			},
			
			{
				name : 'mousedown',
				handler : function (evt) {
						var pos = get_location(evt); 
						pos.x += 5;
						pos.y += 35; 
						prev_point = pos; down = true; 
				}
			},
			
			{
				name : 'mouseup',
				handler : function () { 
					down = false; 
				}
			}
			];
			
			function add_handler() {
				current_tool = tool_list.PENCIL ;
				canvas.style.cursor = 'url(svg/pencil43.svg), auto';
				context.lineWidth = 5;
				context.lineJoin = 'round';
				for(var i = 0; i < event_handlers.length; ++i)
					canvas.addEventListener(event_handlers[i].name, event_handlers[i].handler, false);
			}
			
			function remove_handler() {
				current_tool = tool_list.NOT ;
				canvas.style.cursor = 'default';
				for(var i = 0; i < event_handlers.length; ++i)
					canvas.removeEventListener(event_handlers[i].name, event_handlers[i].handler, false);
			}
			
			return {
				add : add_handler,
				remove : remove_handler
			}
		}());
		
		tool_events[tool_list.POLYGON] = (function() {
			
			var prev_point = { x : 0, y : 0 };
			var first = true;
			
			var event_handlers = [
			{
				name : 'mousedown',
				handler : function (evt) {
						if(first) {
							prev_point = get_location(evt); 
							first = false;
						}
						else {
							var pos = get_location(evt); 
							pos.x += 5;
							pos.y += 25; 
							context.beginPath();
							context.moveTo(prev_point.x, prev_point.y);
							context.lineTo(pos.x, pos.y);
							context.stroke();
							prev_point = pos; 
						}
				}
			}
			];
			
			function add_handler() {
				first = true;
				current_tool = tool_list.POLYGON ;
				canvas.style.cursor = 'url(svg/irregular10.svg), auto';
				for(var i = 0; i < event_handlers.length; ++i)
					canvas.addEventListener(event_handlers[i].name, event_handlers[i].handler, false);
			}
			
			function remove_handler() {
				current_tool = tool_list.NOT;
				canvas.style.cursor = 'default';
				for(var i = 0; i < event_handlers.length; ++i)
					canvas.removeEventListener(event_handlers[i].name, event_handlers[i].handler, false);
			}
			
			return {
				add : add_handler,
				remove : remove_handler
			}
		}());
		
		tool_events[tool_list.FILL] = (function() {
			
			var event_handlers = [
			{
				name : 'click',
				handler : function (evt) {
					var start = get_location(evt); 
					var colorLayer = context.getImageData(0, 0, canvas.width, canvas.height);
					var original = Filters.getColor(colorLayer, start.x, start.y);
					var canvasWidth = canvas.width, canvasHeight = canvas.height ;
					var fill = { r : 25, g : 34, b : 56 };
					var pixelStack = [[start.x, start.y]];

					while(pixelStack.length) {
						var newPos, x, y, pixelPos, reachLeft, reachRight;
						newPos = pixelStack.pop();
						x = newPos[0];
						y = newPos[1];
					  
						pixelPos = (y*canvasWidth + x) * 4;
						while(y-- >= 0 && matchStartColor(pixelPos)) {
							pixelPos -= canvasWidth * 4;
						}
						pixelPos += canvasWidth * 4;
						++y;
						reachLeft = false;
						reachRight = false;
						while(y++ < canvasHeight-1 && matchStartColor(pixelPos)) {
							colorPixel(pixelPos);

							if(x > 0) {
								if(matchStartColor(pixelPos - 4)) {
									if(!reachLeft){
										pixelStack.push([x - 1, y]);
										reachLeft = true;
									}
								}
								else if(reachLeft) {
									reachLeft = false;
								}
							}
						
							if(x < canvasWidth-1) {
								if(matchStartColor(pixelPos + 4)) {
									if(!reachRight) {
										pixelStack.push([x + 1, y]);
										reachRight = true;
									}
								}
								else if(reachRight) {
									reachRight = false;
								}
							}
								
							pixelPos += canvasWidth * 4;
						}
					}
					context.putImageData(colorLayer, 0, 0);
					  
					function matchStartColor(pixelPos)
					{
					  var r = colorLayer.data[pixelPos];	
					  var g = colorLayer.data[pixelPos+1];	
					  var b = colorLayer.data[pixelPos+2];

					  return (r == original.r && g == original.g && b == original.b);
					}

					function colorPixel(pixelPos)
					{
					  colorLayer.data[pixelPos] = fill.r;
					  colorLayer.data[pixelPos+1] = fill.g;
					  colorLayer.data[pixelPos+2] = fill.b;
					  colorLayer.data[pixelPos+3] = 255;
					}
				}
			}
			];
			
			function add_handler() {
				current_tool = tool_list.FILL ;
				canvas.style.cursor = 'url(svg/paint2.svg), auto';
				for(var i = 0; i < event_handlers.length; ++i)
					canvas.addEventListener(event_handlers[i].name, event_handlers[i].handler, false);
			}
			
			function remove_handler() {
				current_tool = tool_list.NOT;
				canvas.style.cursor = 'default';
				for(var i = 0; i < event_handlers.length; ++i)
					canvas.removeEventListener(event_handlers[i].name, event_handlers[i].handler, false);
			}
			
			return {
				add : add_handler,
				remove : remove_handler
			}
		}());
	}
	catch(err) {
		console.log('handler not available');
	}
	
	function adjust_canvas_dimension() {
		canvas.style.height = workarea.clientHeight + 'px';
		canvas.height = workarea.clientHeight ;
		canvas.style.width = workarea.clientWidth + 'px';
		canvas.width = workarea.clientWidth ;
	}
	
	function get_offset(el) {
		var x = 0;
		var y = 0;
		while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
			x += el.offsetLeft - el.scrollLeft;
			y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
		}
		return { top: y, left: x };
	}
	
	function get_location(evt) {
		var offset = get_offset(canvas) ;
		return { x: evt.pageX - offset.left,
		         y: evt.pageY - offset.top }; 
	}
	
	function generate_layer() {
		var layer = document.createElement('canvas');
		var pos = canvas.getBoundingClientRect();
		layer.style.position = 'absolute' ;
		layer.style.top = pos.top ;
		layer.style.left = pos.left ;
		layer.style.height = canvas.clientHeight + 'px';
		layer.height = canvas.clientHeight ;
		layer.style.width = canvas.clientWidth + 'px';
		layer.width = canvas.clientWidth ;
		return layer ;
	}
	
	/******************************************************************
	Adding the required event listeners
	*******************************************************************/
	adjust_canvas_dimension();
	upload.setAttribute('type', 'file');
	upload.addEventListener('change', read_file, false);
	document.getElementById('new-document').addEventListener('click', display_file_dialog, false);
	document.getElementById('del-document').addEventListener('click', restore_canvas, false);
	for(var i = 0; i < tools.length; ++i) {
		(function (index) {
			tools[i].addEventListener('click', function() {
				tool_events[current_tool].remove();
				tool_events[index + 1].add();
			}, false);
		}(i));
	}
	var down = false;
	
	
	
	function blur() {
		var input = context.getImageData(0, 0, canvas.width, canvas.height);
		var output = Filters.blur(input);
		context.putImageData(output, 0, 0);
	}
	
	function draw_canvas() {
		workarea.style.height = img.height + 'px';
		workarea.style.width = img.width + 'px' ;
		canvas.height = img.height;
		canvas.width = img.width ;
		context.drawImage(img, 0, 0);
	}
	
	function restore_canvas() {
		workarea.style.height = '100%';
		workarea.style.width = '98%';
		canvas.height = canvas.width;
	}
	
	function read_file(evt) {
		var file = evt.target.files[0];
		if(!file.type.match('image.*'))
			return;
		img.file = file;
		img.onload = draw_canvas;
		img.crossOrigin = 'crossdomain.xml';
    
		var reader = new FileReader();
		reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
		reader.readAsDataURL(file);
	}
	
	function display_file_dialog() {
		//var event = new Event('click');
		//upload.dispatchEvent(event);
		upload.click();
		console.log('triggering...');
	}
	
	
}());