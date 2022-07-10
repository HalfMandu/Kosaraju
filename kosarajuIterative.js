/* 
	Kosaraju's Two-Pass Algorithm  - JS Iterative Implementation - O(m + n)
	Stephen Rinkus
		
		Iterative approach - this approach makes it more feasible to intake a large file.
		Uses Stack to carry out the exploration.
*/

import { Graph } from "./Graph.js";
import { Stack } from "./Stack.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { performance } = require('perf_hooks');

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Main

class KosarajuIterative {

	constructor(graph) {
		this.finishTimes = [];
		this.graph = graph;
	};
	
	//First DFS wrapper
	getFinishTimes = () => {
	
		let explored = {}; 
		let finished = {};
		
		//try each point seperately, work downwards from nth element...
		for (const vert of [...this.graph.vertices.keys()].sort().reverse()){
			if (!explored[vert]){
				this.dfsFinishTimes(vert, explored, finished);	
			}
		}
	
		console.log("First DFS done");
		//console.log("finishTimes: " + this.finishTimes);
	};
	
	//First iterative dig - collecting finishing times 
	dfsFinishTimes = (vert, explored, finished) => {
	
		const stack = new Stack();
		stack.push(vert);
		
		//take a vert, explore it, then add its neighbors to the stack
 		while (!stack.isEmpty()) {
			const vert = stack.pop();
			if (!explored[vert]){
				explored[vert] = true;
				stack.push(vert);
				for (const neighbor of this.graph.vertices.get(vert)){
					stack.push(neighbor);
				}
			} else {
				//if the vert has already been explored, and its neighbors added to stack, it's finished
				if (!finished[vert]) {
					this.finishTimes.push(vert);
					finished[vert] = true;
				}
			}
		} 
	};
	
	//Second DFS - peel off SCC's and note their sizes
	getSccLeaders = () => {
		
		let explored = {};  	 //boolean explored status of a given vert
		const sccs = [];  	 	 //2D array, a list of SCC's
		const sccSizes = [];	 //a list of known scc sizes
		
		//proccess nodes based on decreasing finishing times
		for (const vert of this.finishTimes.reverse()){
			if (!explored[vert]){
				const scc = [];  	//all verts seen onward here should be added to the leader's scc
				this.peelOffScc(vert, explored, scc);   //from here, visit all possible verts
				sccs.push(scc);							
				sccSizes.push(scc.length);
			}
		}
		
		//all scc's collected - get the biggest 5
		console.log("Top 5 SCC sizes: ");
		console.log(sccSizes.sort((a, b) => a - b).slice(-5));
	};

	//Recursive DFS helper to remove SCC's one at a time from reversed graph
	peelOffScc = (vert, explored, scc) => {
		
		//finding another member of this scc
		scc.push(vert);
		explored[vert] = true;
		
		const stack = new Stack();
		stack.push(vert);
		
		//DFS - take a vert, explore it, then add its neighbors to the stack
		while (!stack.isEmpty()) {
			const vert = stack.pop();
				for (const neighbor of this.graph.vertices.get(vert)){
					if (!explored[neighbor]){
						explored[neighbor] = true;
						scc.push(neighbor);
						stack.push(neighbor);
					}
				}
		}
		
	}
	
}

//Take input edge list txt file and return a directed Graph
const getGraphFromFile = async (sccFile) => {

	const util = require('util');
	const fs = require('fs');
	const lines = (await util.promisify(fs.readFile)(sccFile)).toString().split('\r\n');
	const graph = new Graph("DIRECTED");
	
	//each line has two columns: vertex v1, and its outbound neighbor vertex v2
	lines.map(line => {

		if (!line) { return null; }
				
		const [v1, v2] = line.toString().split(' ');  
		
		//excluding self loops
		if (v1 != v2) {
			graph.addEdge(v1, v2);
		}

	});

	return graph;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Driver

console.log("Starting Kosaraju (iterative)...");

//Fetch file
getGraphFromFile('./SCC_small.txt').then((graph) => {

	const startTime = performance.now();
	
	const kosaraju = new KosarajuIterative(graph);
	
	console.log("Reversing graph... ");
	kosaraju.graph.reverse();
		
	console.log("DFS first pass... ");
	kosaraju.getFinishTimes();
	
	console.log("Re-reversing graph... ");
	kosaraju.graph.reverse();
			
	console.log("DFS second pass... ");
	kosaraju.getSccLeaders();
	
	const endTime = performance.now();
	const runDuration = (endTime/1000) - (startTime/1000);
	
	console.log("Kosaraju took " + runDuration.toFixed(2) + " seconds");  // ~9 seconds

});
