const { getDistance } = require('./distance');
function getOptimalRoute(nodes) {
    const n = nodes.length;
  
    //Building distance matrix
    const graph = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          graph[i][j] = getDistance(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng);
        }
      }
    }
  
    //Greedy approach to find nearest neighbour
    const visited = new Array(n).fill(false);
    const route = [0]; // Start from NGO (assumed at index 0)
    let totalDistance = 0;
    visited[0] = true;
    let current = 0;
  
    for (let step = 1; step < n; step++) {
      let nearest = -1;
      let minDist = Infinity;
  
      for (let i = 1; i < n; i++) {
        if (!visited[i] && graph[current][i] < minDist) {
          minDist = graph[current][i];
          nearest = i;
        }
      }
  
      if (nearest !== -1) {
        route.push(nearest);
        totalDistance += minDist;
        visited[nearest] = true;
        current = nearest;
      }
    }


    const orderedIds = route.map(i => nodes[i]._id);
  
    return {
      orderedIds,
      totalDistance
    };
  }
  module.exports = { getOptimalRoute };