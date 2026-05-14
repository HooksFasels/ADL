const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3004');
ws.on('open', () => console.log('Connected to WS'));
ws.on('message', (data) => console.log('Received:', data.toString()));
ws.on('error', (err) => console.error('WS Error:', err));
