import { Server, Socket } from 'socket.io';

namespace Backend.RelayServer {
  class BoardServer {
    io: Server;
    boardClients: Socket[] = [];

    constructor(port: number){
      this.io = new Server(port);

      this.io.on('connection', (socket) => {
        socket.emit("Hello", "world");

        // Code to handle new WebSocket connections
        this.boardClients.push(socket);

        socket.on("cursorPositionUpdate", (arg) => {
          console.log(arg);
        });

        socket.on('close', (close) => {
          console.log(close);
        });
      });
    }
  }
}
