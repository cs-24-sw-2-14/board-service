import { createServer, IncomingMessage, ServerResponse } from 'http';
const port = 3001;
 
const server = createServer((request: IncomingMessage, response: ServerResponse) => {
  response.end('Hello world!');
});
 
server.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
