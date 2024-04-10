import WebSocket from 'ws';

class NetworkedBoardUser {
  WebSocket: WebSocket;

  constructor(webSocket: WebSocket) {
    this.WebSocket = webSocket;
  }
}