import WebSocket from 'ws';

export class NetworkedBoardUser {
  WebSocket: WebSocket;

  constructor(webSocket: WebSocket) {
    this.WebSocket = webSocket;
  }
}