import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Board } from "./board";

/**
 * Contains boards.
 */
export class Server {
  BoardList: Board[] = [];
  Port: number;

  constructor(port: number) {
    this.Port = port;

    this.BoardList.push(new Board("A1B2C3"));
  }

  StartServerAsync(){ 
    const server = createServer((request: IncomingMessage, response: ServerResponse) => {
      response.write(this.BoardList[0].UID);
      response.end('Hello world!');
    });
     
    server.listen(this.Port, () => {
      console.log(`Server listening on port ${this.Port}`);
    });    
  }
}

