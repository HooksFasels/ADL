fetch('https://router.project-osrm.org/route/v1/driving/76.9558,11.0168;76.9867,11.013;77.0028,11.0247?overview=full&geometries=geojson')
  .then(r => r.json())
  .then(data => {
    const coords = data.routes[0].geometry.coordinates;
    console.log(`Total points: ${coords.length}`);
    console.log(`Start: ${coords[0]}`);
    console.log(`Mid: ${coords[Math.floor(coords.length/2)]}`);
    console.log(`End: ${coords[coords.length-1]}`);
  });
