const fs = require('fs');
const { exit } = require('process');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

readline.question(`Enter Input File name? `, file_name => {
    fs.readFile(`input/${file_name}`,'utf-8', (err,data) => {
        if (err) throw err;
        const input_data = JSON.parse(data);
        const locations = input_data.locations;
        let destination;
        let origins = []
        let waypoints = []
        let variables = []

        let waypoints_data = Array(locations.length).fill().map(()=>Array(locations.length).fill(0))

        for(let l = 0; l < locations.length; l++){

            if(locations[l].kind === 'destination'){
                destination = locations[l]
            }   
            if(locations[l].kind === 'origin'){
                origins.push(locations[l])
            }
            if(locations[l].kind === 'waypoint'){
                waypoints.push(locations[l])
            }
        }

        let newObj = {
            "locations": [
                ...waypoints,
                ...origins,
                destination
            ]
        }

        for (let index = 0; index < newObj.locations.length; index++) {
            
            for (let c = 0; c < newObj.locations[index].connections.length; c++) {
    
                if(newObj.locations[index].connections[c].to.substr(0,1) === 'W'){
                    let c_index = parseInt(newObj.locations[index].connections[c].to.substr(1))
                    waypoints_data[index][c_index-1] = newObj.locations[index].connections[c].distance/newObj.locations[index].connections[c].speed
                }else if(newObj.locations[index].connections[c].to.substr(0,1) === 'O'){
                    let c_index = parseInt(newObj.locations[index].connections[c].to.substr(1))
                    waypoints_data[index][(waypoints.length - 1) + c_index] = newObj.locations[index].connections[c].distance/newObj.locations[index].connections[c].speed
                }else if(newObj.locations[index].connections[c].to.substr(0,1) === 'D'){
                    waypoints_data[index][newObj.locations.length - 1] = newObj.locations[index].connections[c].distance/newObj.locations[index].connections[c].speed
                }
            }
            
            variables.push(newObj.locations[index].name)

        }

        // **************************************

        // A Javascript program for Dijkstra's
        // single source shortest path
        // algorithm. The program is for
        // adjacency matrix representation
        // of the graph.
        let NO_PARENT = -1;
        let distance_arr = [];
        let path_arr = []
        let result = {"locations":[]}

        function dijkstra(adjacencyMatrix,startVertex)
        {
            let nVertices = adjacencyMatrix[0].length;

                // shortestDistances[i] will hold the
                // shortest distance from src to i
                let shortestDistances = new Array(nVertices);

                // added[i] will true if vertex i is
                // included / in shortest path tree
                // or shortest distance from src to
                // i is finalized
                let added = new Array(nVertices);

                // Initialize all distances as
                // INFINITE and added[] as false
                for (let vertexIndex = 0; vertexIndex < nVertices;
                                                    vertexIndex++)
                {
                    shortestDistances[vertexIndex] = Number.MAX_VALUE;
                    added[vertexIndex] = false;
                }
                
                // Distance of source vertex from
                // itself is always 0
                shortestDistances[startVertex] = 0;

                // Parent array to store shortest
                // path tree
                let parents = new Array(nVertices);

                // The starting vertex does not
                // have a parent
                parents[startVertex] = NO_PARENT;

                // Find shortest path for all
                // vertices
                for (let i = 1; i < nVertices; i++)
                {

                    // Pick the minimum distance vertex
                    // from the set of vertices not yet
                    // processed. nearestVertex is
                    // always equal to startNode in
                    // first iteration.
                    let nearestVertex = -1;
                    let shortestDistance = Number.MAX_VALUE;
                    for (let vertexIndex = 0;
                            vertexIndex < nVertices;
                            vertexIndex++)
                    {
                        if (!added[vertexIndex] &&
                            shortestDistances[vertexIndex] <
                            shortestDistance)
                        {
                            nearestVertex = vertexIndex;
                            shortestDistance = shortestDistances[vertexIndex];
                        }
                    }

                    // Mark the picked vertex as
                    // processed
                    added[nearestVertex] = true;

                    // Update dist value of the
                    // adjacent vertices of the
                    // picked vertex.
                    for (let vertexIndex = 0;
                            vertexIndex < nVertices;
                            vertexIndex++)
                    {
                        let edgeDistance = adjacencyMatrix[nearestVertex][vertexIndex];
                        
                        if (edgeDistance > 0
                            && ((shortestDistance + edgeDistance) <
                                shortestDistances[vertexIndex]))
                        {
                            parents[vertexIndex] = nearestVertex;
                            shortestDistances[vertexIndex] = shortestDistance +
                                                            edgeDistance;
                        }
                    }
                }

                printSolution(startVertex, shortestDistances, parents);
        }

        function printSolution(startVertex,distances,parents)
        {
            let nVertices = distances.length;
                for (let vertexIndex = 0;
                        vertexIndex < nVertices;
                        vertexIndex++)
                {
                    if (vertexIndex != startVertex)
                    {
                        if(vertexIndex == nVertices -1){
                            printPath(vertexIndex, parents);
                            distance_arr.push(distances[vertexIndex])
                            result.locations.push({
                                "origin": variables[startVertex],
                                "destination": variables[vertexIndex],
                                "cost": distances[vertexIndex],
                                "path":  path_arr   
                            })
                            path_arr = []
                        }
                    }
                }
        }

        function printPath(currentVertex,parents)
        {
            // Base case : Source node has
                // been processed
                if (currentVertex == NO_PARENT)
                {
                    return;
                }
                printPath(parents[currentVertex], parents);
                path_arr.push(variables[currentVertex])
        }

        let graph = waypoints_data;

        for(let i=0; i<origins.length; i++){
            dijkstra(graph,variables.indexOf(origins[i].name))
        }

        // PICK the shortest distance
        console.log("Fastest route:  "+ result.locations[distance_arr.indexOf(Math.min(...distance_arr))].path)
        console.log("Distance:       "+ result.locations[distance_arr.indexOf(Math.min(...distance_arr))].cost)

        // Write it to the file
        fs.writeFile(`output/solution-${file_name.split('-')[2]}.json`, JSON.stringify(result.locations[distance_arr.indexOf(Math.min(...distance_arr))]) , function (err) {
            if (err) throw err;
            console.log('Saved!');
          });
        
    })    
    readline.close()
})



