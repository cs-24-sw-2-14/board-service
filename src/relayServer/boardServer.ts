import { WebSocketServer, WebSocket, MessageEvent } from "ws";

namespace Backend.RelayServer {

  class BoardServer {
    wss: WebSocketServer;
    boardClients: WebSocket[] = [];

    constructor(port: number){
      this.wss = new WebSocket.Server({ 'port': port });

      this.wss.on('connection', (ws: WebSocket) => {
        // Code to handle new WebSocket connections
        this.boardClients.push(ws);

        ws.on('close', (close: CloseEvent) => {
          console.log("Closed");
        });
      });

      this.wss.on('message', (message: MessageEvent) => {
        // Code to handle incoming messages

      });

    }
  }
}
