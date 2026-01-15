import express from 'express';
import type { Application } from 'express';
import http from 'http';
import cors from 'cors';

export class Server {
  private readonly app: Application;
  private readonly httpServer: http.Server;

  constructor(private readonly port: number) {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.registerMiddlewares();
  }

  private registerMiddlewares() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  private registerRoutes() {}

  private registerErrorHandler() {}

  public start() {
    this.registerRoutes();
    this.registerErrorHandler();

    this.httpServer.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
