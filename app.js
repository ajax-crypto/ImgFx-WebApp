var ImgFx = (function() {
	
	var upload = document.createElement('input');
	var canvas = document.getElementById('drawing-canvas');
	var workarea = document.getElementById('work-area');
	var context = canvas.getContext('2d');
	var img = document.createElement('img');
	
	/******************************************************************
	Adding the required event listeners
	*******************************************************************/
	upload.setAttribute('type', 'file');
	upload.addEventListener('change', read_file, false);
	document.getElementById('new-document').addEventListener('click', display_file_dialog, false);
	document.getElementById('del-document').addEventListener('click', restore_canvas, false);
	//document.getElementById('blur').addEventListener('click', blur, false);
	
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