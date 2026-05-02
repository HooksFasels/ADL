import { WebSocketServer as WsServer } from 'ws';
import http from 'http';
import { ConnectionManager } from '@/core/websocket/ConnectionManager';

export class WebSocketServer {
  private wss: WsServer;
  private connectionManager = new ConnectionManager();

  constructor(server: http.Server) {
    this.wss = new WsServer({ server });
  }

  start() {
    this.wss.on('connection', (socket) => {
      this.connectionManager.register(socket);
    });
    console.log('WebSocket server started');
  }

  getConnectionManager() {
    return this.connectionManager;
  }
}
