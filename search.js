fetch('https://nominatim.openstreetmap.org/search?format=json&q=PSG+College+of+Technology+Coimbatore', {
  headers: { 'User-Agent': 'ADL-Sim-Test/1.0' }
})
  .then(res => res.json())
  .then(data => console.log(data));
