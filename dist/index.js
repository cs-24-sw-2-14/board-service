"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const port = 3001;
const server = (0, http_1.createServer)((request, response) => {
    response.end('Hello world!');
});
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
