import express, { Express, Request, Response } from "express";
import { Server } from "socket.io";
import { Boards } from "./boards"

const app: Express = express();
const httpPort = 5123;

const server = require('http').createServer(app);
const socketio = new Server(server);
const socketIoPort = 6123;

let boards: Boards = new Boards(socketio)

app.post("/v1/board/create", (_, res: Response) => {
  let boardId = JSON.stringify(boards.createBoard())
  res.send(boardId);
});

app.get("/v1/board/join", (req: Request, res: Response) => {
  let body = JSON.parse(req.body)
  let boardIsValid = boards.doesBoardExist(body.boardID)
  res.send(JSON.stringify({ 'doesExist': boardIsValid }));
});

socketio.listen(socketIoPort);
app.listen(httpPort, () => {
  console.log(`[server]: Server is running at http://localhost:${httpPort}`);
});
