import { WebSocket } from 'ws';
import { Connection } from '@/core/websocket/Connection';
import { TrackingService } from '@/domain/tracking/TrackingService';
import type { LocationPayload } from '@/domain/tracking/TrackingSession';
import { randomUUID } from 'crypto';

export class ConnectionManager {
  private connections = new Map<string, Connection>();
  private trackingService = new TrackingService();

  register(socket: WebSocket) {
    const id = randomUUID();
    const conn = new Connection(socket, id);
    this.connections.set(id, conn);

    socket.on('message', (msg) => {
      this.trackingService.handleMessage(id, msg.toString(), this.onLocation);
    });

    socket.on('close', () => {
      this.connections.delete(id);
      this.trackingService.removeSession(id);
    });
  }

  private onLocation(clientId: string, payload: LocationPayload) {
    console.log(`[${clientId}] lat: ${payload.lat}, lon: ${payload.lon}`);
  }
}
