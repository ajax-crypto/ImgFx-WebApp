var ImgFx = (function() {
	
	var tool_list = Object.freeze(
	{
		NOT : 0,
		PENCIL : 1,
		POLYGON : 2
	});
	var current_tool = tool_list.NOT;
	
	var upload = document.createElement('input');
	var canvas = document.getElementById('drawing-canvas');
	var workarea = document.getElementById('work-area');
	var context = canvas.getContext('2d');
	var img = document.createElement('img');
	var tools = document.getElementsByClassName('tool-container');
	
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