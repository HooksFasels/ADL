fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=11.0241&lon=76.9636', {
  headers: { 'User-Agent': 'ADL-Sim-Test/1.0' }
})
  .then(res => res.json())
  .then(data => console.log(data.display_name));
