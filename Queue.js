class Queue extends Array {
	
	//Array already pushes item to the back 
    enqueue(val) {
        this.push(val);
    }
	
	//Array can already remove from the front (and return removed item)
    dequeue() {
        return this.shift();
    }
	
	//easy to read a value at an index
    peek() {
        return this[0];
    }
	
	//Array already has a length function
    isEmpty() {
        return this.length === 0;
    }

}

export { Queue };
//module.exports = { Queue };

