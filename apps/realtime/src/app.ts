import { HttpServer } from '@/core/server/HttpServer';
import { WebSocketServer } from '@/core/server/WebSocketServer';
import { connectKafkaProducer } from '@/config/kafka';

export class App {
  private httpServer: HttpServer;
  private wsServer: WebSocketServer;

  constructor() {
    connectKafkaProducer();
    this.httpServer = new HttpServer();
    this.wsServer = new WebSocketServer(this.httpServer.getServer());
  }

start() {
  this.httpServer.start();
  this.wsServer.start();
}
};
