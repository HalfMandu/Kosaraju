/* 
* 	Kosaraju's Two-Pass Algorithm  - JS Implementation - O(m + n)
*   Stephen Rinkus
*
*		Recursive implementation of Kosaraju
*		Works better for smaller file sizes -- large input creates a big recursion frame stack
*
*		node --stack-size=32000 '.\kosaraju.js'
*/

const { Graph } = require('./Graph.js');

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Main

let fTime = 0;			//finishing times in 1st pass...also counts how many nodes processed so far
const finishTimes = {};	//maps verts to their finishing times
let explored = {};  	//maps verts to their visited status
let source = null;		//tracks most recent vertex from which dfs started
const leaders = {};		//maps leader verts to an array of the verts in their SCC
const sccSizes = {};	//maps leader verts to their SCC size

//Outer loop to run dfs on all the points and collect finishing times
const dfsFinishingTimes = (graph) => {
		
	//try each point seperately, work downwards from nth element...
	for (let vert of [...graph.vertices.keys()].sort().reverse()){
		if (!explored[vert]){
			dfsFirst(graph, vert);	//recurse
		}
	}
	
	console.log("finishTimes");
	console.log(finishTimes);
};

//Dig down on a vertex
const dfsFirst = async (graph, vert) => {

	explored[vert] = true;
	
	//check all outbound edges from vert
	for (let neighbor of graph.vertices.get(vert)) {  
		if (!explored[neighbor]){
			dfsFirst(graph, neighbor);
		}
	}
	
	//once all this verts' neighbors have been seen, we can increment finish time and store it as finished 
	fTime++;		
	finishTimes[vert] = fTime;
	
};
		
//Second dfs pass, to discover leaders of SCC's
const dfsSccLeaders = (graph) => {
	
	explored = {};		//reset explored map
	
	//process verts based on their finishing times - back to front
	for (let vert of Object.values(finishTimes).sort().reverse()){
			
		explored[vert] = true;	  //discover node
		source = vert; 			  //reset the new source vertex  
		
		//check all outbound edges from vert
		for (let neighbor of graph.vertices.get(vert.toString())) {  
			if (!explored[neighbor]){
				dfsSecond(graph, neighbor, source);
			}
		}
	}
};

//2nd dfs pass helper			
const dfsSecond = async (graph, vert, source) => {

	explored[vert] = true;
	
	//check all outbound edges from vert
	for (let neighbor of graph.vertices.get(vert)) {  
		if (!explored[neighbor]){
			dfsSecond(graph, neighbor, source);
		}
	}
	
	//once all of this vert's neighbors have been visited, make note of the source DFS point which started it
	//also counting scc sizes on the way by
	if (!leaders[source]){
		leaders[source] = [];
		sccSizes[source] = 1;
	}	
	leaders[source].push(vert);
	sccSizes[source]++;
};
	
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Helpers

//Take input edge list txt file and return a directed Graph
const getGraphFromFile = async (sccFile) => {

	const util = require('util');
	const fs = require('fs');
	const lines = (await util.promisify(fs.readFile)(sccFile)).toString().split('\r\n');
	const graph = new Graph("DIRECTED");
	
	//each line has two columns: vertex v1, and its outbound neighbor vertex v2
	lines.map(line => {

		if (!line) { return null; }
				
		let [v1, v2] = line.toString().split(' ');  
		
		//excluding self loops
		if (v1 != v2) {
			graph.addEdge(v1, v2);
		}

	});

	return graph;
};

//Reset the Graph labels based on the finishing times of the first DFS call 
const replaceLabels = (graph) => {
	
	const leaderGraph = new Graph("DIRECTED");
	
	//replace vertices with their finishing times
	for (let [vert] of graph.vertices){
		for (let neighbor of graph.vertices.get(vert)){
			leaderGraph.addEdge(finishTimes[vert].toString(), finishTimes[neighbor].toString());
		}
	}
	
	graph.vertices = leaderGraph.vertices;
	
}; 

//Convert object key/val pairs to array so they can be sorted
const sortLeaders = () => {

	const leadersSorted = [];
	for (let leader in sccSizes) {
		leadersSorted.push([leader, sccSizes[leader]]);
	}

	leadersSorted.sort((leader1, leader2) => leader1[1] - leader2[1] );
	
	console.log("leadersSorted: ");
	console.log(leadersSorted);
	
	let topSccSizes = [];
	for (let [leader, sccSize] of Object.values(leadersSorted)) {
		topSccSizes.push(sccSize);
	}
	
	console.log("top Scc Sizes: " + topSccSizes.sort().slice(0,5));
	
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Driver

/** DIRECTED GRAPH: 9 NODES, 11 EDGES
	*
	*   AFTER FIRST REVERSE:     
    *
	*       1 ---> 7 ---> 9 ---> 6 ---> 8 <-
	*       ^     /		  ^     /	    |    \
	*       <- 4 <		  <- 3 <	    > 2 -> 5
	*           
	*       (Start 9) Finish order: 3, 5, 2, 8, 6, 9, 1, 4, 7         
	*            	
	*   AFTER LABLE REPLACEMENT:             
	*         
	*		7 <--- 9 <--- 6 <--- 5 <--- 4 <-
	*       |      ^	  |      ^ 	    ^    \
	*       -> 8 /		  -> 1 /	    < 3 <- 2
	*
	*		Leaders: 9 (9,7,8), 6 (6,1,5), 4 (4,2,3)
*/

console.log("Starting Kosaraju...");

//Fetch file
getGraphFromFile('./data/SCC_small.txt').then((graph) => {

	console.log("Reversing graph... ");
	graph.reverse();
	
	console.log("DFS first pass, collecting finishing times... ");
	dfsFinishingTimes(graph);
	
	console.log("Re-reversing graph... ");
	graph.reverse();
	
	console.log("Replacing verts with their finishing times... ");
	replaceLabels(graph);
		
	console.log("DFS second pass, assigning leaders to sccs... ");
	dfsSccLeaders(graph);
	
	console.log("Getting top leaders... ");
	sortLeaders();

});


