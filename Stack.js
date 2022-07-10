class Stack {

	//leveraging JavaScript Array
	constructor() {
		this.items = [];
	}

	//push to end of list, already avaiable from Array.prototype  
	push = (item) => {
		this.items.push(item);
	}

	//pop from end of list (and return item), already avaiable from Array.prototype
	pop = () => this.items.pop();

	//view front item...treat the last position of an array as the front
	peek = () => this.items[this.items.length - 1];

	//easy to check if empty with Array's built in length function
	isEmpty = () => this.items.length === 0;

	//clear the stack   
	clear = () => this.items.length = 0;

	//Array.prototype.length 
	size = () => this.items.length;

}

export { Stack };
//module.exports = { Stack };
