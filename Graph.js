/* 
* 	Graph
*   Stephen Rinkus
* 
*	This Graph implementation uses a map to associate int keys with vertice arrays
*/


import { Queue } from "./Queue.js";
import { Stack } from "./Stack.js";


class Graph {
	
	//Each graph instance has a mapping of vertices to their adjacents...(int key, [] neighbors)
	constructor(graphType = "UNDIRECTED") {
		this.vertices = new Map();
		this.graphType = graphType;  //DIRECTED, UNDIRECTED
	};

	//Add a vertex to the graph...
	addVertex(v) {
		
		//only if it doesn't already exist
		if (!this.vertices.has(v)){
			//a new vertex doesn't have neighors yet...initialize the adjacent list with an empty array
			this.vertices.set(v, []);		
		}
		
	};

	//Add a new edge to the graph...allowing addition new vertices
	addEdge(v1, v2) {
		
		//adds vertices if they don't exist
		this.addVertex(v1);
		this.addVertex(v2);
		
		//if they don't already reference eachother, make them
		if (!(this.vertices.get(v1)).includes(v2)){
			this.vertices.get(v1).push(v2);
			this.graphType === "UNDIRECTED" ? this.vertices.get(v2).push(v1) : null;
		}
		
	};
	
	//Delete a vertex from the graph
	removeVertex(v) {
		
		//only delete it if it exists
		if (this.vertices.has(v)){
			
			//go through each of its neighbors' lists and remove their ref to it
			for (const neighbor of this.vertices.get(v)){
				this.vertices.get(neighbor).splice(neighbor.indexOf(v), 1); 
			}
			
			//finally, delete obsolete v
			this.vertices.delete(v);
		}
	};
	
	//Delete an edge from the graph
	removeEdge(v1, v2) {
		
		//remove v1 and v2's refs to each other (if they both exist and are neighbors)
		if (this.vertices.has(v1) && this.vertices.has(v2) && this.vertices.get(v1).includes(v2)){
			this.vertices.get(v1).splice(this.vertices.get(v1).indexOf(v2), 1); 
			this.graphType === "UNDIRECTED" ? this.vertices.get(v2).splice(this.vertices.get(v2).indexOf(v1), 1) : null;
		}
		
	};
		
	//Breadth first search - queue
	bfs(start) {

		//track visibility boolean for each vertex
		const explored = {};
	 
		//FIFO queue to manage discovery order of BFS
		const exploreQueue = new Queue();
	 
		//mark the starting vertex as explored and add it to the queue
		explored[start] = true;
		exploreQueue.enqueue(start);
		console.log(start);
		
		//keep discovering vertices until queue is empty
		while (!exploreQueue.isEmpty()) {
			//loop through the lists and add a vertex to the queue if it is not explored yet
			for (const neighbor of this.vertices.get(exploreQueue.dequeue())){
				if (!explored[neighbor]){
					explored[neighbor] = true;
					exploreQueue.enqueue(neighbor);
					console.log(neighbor); 
				}
			}
		}		
	};
	
	//Depth first search - recursive
	dfs(start, explored) {
		
		//explored begins as empty {}
		explored[start] = true;
		console.log(start);
		
		for (const neighbor of this.vertices.get(start)){
			if (!explored[neighbor]){
				explored[neighbor] = true;
				this.dfs(neighbor, explored);
			}
		}		
	};
	
	//Depth first search - stack
	dfsStack(start) { 
		
		const explored = {};
		const exploreStack = new Stack();
		exploreStack.push(start);
		
		while (!exploreStack.isEmpty()) {
			const nextVert = exploreStack.pop();
			if (!explored[nextVert]){
				explored[nextVert] = true;
				console.log(nextVert);
				for (const neighbor of this.vertices.get(nextVert)){
					exploreStack.push(neighbor);
				}
			}
		}
	};
	
	//Helper for topologicalSort() to recurse on a vertex and track levels of precedence
	topSortRecurser(vertex, numVerts, explored, order) {
	   
		//visit this vert
		explored[vertex] = true;
	   	
		const neighbors = this.vertices.get(vertex);
		
		//check each neighbor -- if they aren't explored, recurse on them and update vert counter
		for (const neighbor of this.vertices.get(vertex)){
			if (!explored[neighbor]) {
				numVerts = this.topSortRecurser(neighbor, numVerts, explored, order);
			}
		} 
		
		//when there's no more outbound arcs, decrement size and put the vertex in its rightful place now
		order[numVerts] = vertex;
		return numVerts - 1;
	}
	
	//This approach passes the information forward with parameters
	topologicalSort(){
	
		let explored = {};		//keeps track of which verts have been visited
		let order = {};			//object tracking vertices to their final order position
		const numVerts = this.vertices.size;
				
		//For every unvisited vertex, explore it and neighors
		for (const [vertex] of this.vertices){	
			if (!explored[vertex]) {
				this.topSortRecurser(vertex, numVerts, explored, order);
			}
		};
				
		return order;
	}

	//Reverse all of the arcs -- transpose graph
	reverse(){
	
		const graphReversed = new Graph(this.graphType);
		
		for (const [vertex] of this.vertices){
			this.vertices.get(vertex).forEach(neighbor => {
				graphReversed.addEdge(neighbor, vertex);
			});
		}		
			
		return graphReversed;
		
	};
	
	//check if graph holds a certain value
	contains(value){ };
	
	//check if graph holds a certain edge
	hasEdge(edge){ };
	
	//Prints all vertices and their adjacency lists
	printGraph() {
		console.log(this.graphType + " GRAPH: ");
		//extract key/vals and display them
		for (const [vertex, neighbors] of this.vertices){
			console.log(vertex, neighbors);
		}
	};
	
}

////////////////////////////////////////////////////////////////////////////////////////////////
//Driver

/** 	9 edges, 8 nodes
	*
	*           A
	*        /  | \
	*      D -> E  B
	*           |   \
	*           F <- C
	*           |     
	*           G 	
	*           |
	*           H
*/
//const graph = new Graph("DIRECTED");

//initialize graph by adding edges
/* graph.addEdge('A', 'B');
graph.addEdge('A', 'D');
graph.addEdge('A', 'E');
graph.addEdge('B', 'C');
graph.addEdge('D', 'E');
graph.addEdge('E', 'F');
graph.addEdge('C', 'F');
graph.addEdge('F', 'G');
graph.addEdge('G', 'H'); 
//graph.addEdge('Y', 'Z');  //just dummy verts, seperated from the rest/unreachable...

graph.printGraph(); */

/* console.log("BFS...");
graph.bfs('A');

console.log("DFS...");
graph.dfs('A', {});

console.log("DFS Stack...");
graph.dfsStack('A'); 

console.log("topologicalSort...");
console.log(graph.topologicalSort());

console.log("Removing vertex...");
graph.removeVertex('F');
graph.printGraph();

console.log("Removing edge...");
graph.removeEdge('B', 'C');
graph.printGraph();  
*/

/* console.log("Reversing graph...");
let graphReversed = graph.reverse();
graphReversed.printGraph();
 */
////////////////////////////////////////////////////////////////////////////////////////////////

export { Graph };





