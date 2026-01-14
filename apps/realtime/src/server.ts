import { WebSocketServer } from 'ws';

type ClientMeta = {
  subscriptions: Set<string>;
};

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map<any, ClientMeta>();

wss.on('connection', (ws) => {
  console.log('🟢 Client connected');

  clients.set(ws, {
    subscriptions: new Set(),
  });

  ws.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      handleMessage(ws, message);
    } catch {
      ws.send(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });

  ws.on('close', () => {
    console.log('🔴 Client disconnected');
    clients.delete(ws);
  });

  ws.on('pong', () => {
    console.log('🏓 Pong received');
  });
});

function handleMessage(ws: any, message: any) {
  const meta = clients.get(ws);
  if (!meta) return;

  switch (message.type) {
    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG' }));
      break;

    case 'SUBSCRIBE':
      meta.subscriptions.add(message.channel);
      ws.send(
        JSON.stringify({
          type: 'SUBSCRIBED',
          channel: message.channel,
        }),
      );
      break;

    case 'UNSUBSCRIBE':
      meta.subscriptions.delete(message.channel);
      ws.send(
        JSON.stringify({
          type: 'UNSUBSCRIBED',
          channel: message.channel,
        }),
      );
      break;

    default:
      ws.send(JSON.stringify({ error: 'Unknown message type' }));
  }
}

console.log('Realtime server running on ws://localhost:8080');
