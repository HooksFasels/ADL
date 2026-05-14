import { WebSocket } from "ws";

export class Connection {
  constructor(
    public readonly socket: WebSocket,
    public readonly clientId: string
  ) {}

  send(data: any) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.socket.send(message);
  }
}
