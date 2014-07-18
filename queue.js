function Queue() {
	
	var that = this;
	var queue = [];
	var front = rear = 0;
	
	that.enqueue = function (data) {
		queue[front] = data ;
		++front ;
	}
	
	that.dequeue = function () {
		var ret = {};
		if(rear < front) {
			ret = queue[rear];
			++rear;
		}
		adjust();
		return ret;
	}
	
	that.size = function () {
		return front ;
	}
	
	function adjust() {
		if(front == rear) 
			front = rear = 0;
	}
	
}
		
	
	
	
	