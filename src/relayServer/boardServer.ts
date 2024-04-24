import { WebSocketServer, WebSocket } from "ws";

namespace Backend.RelayServer {

  class BoardServer {
    wss: WebSocketServer;

    constructor(port: number){
      this.wss = new WebSocket.Server({ 'port': port });
    }
  }
}
