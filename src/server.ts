import express, { Express, Request, Response } from "express";
import { createServer } from "http"
var cors = require('cors');
import { Server } from "socket.io";
import { Boards } from "./boards"

const app: Express = express();
app.use(express.json());
app.use(cors());
const httpPort = 5123;

const socketIoPort = 6123;
const httpServer = createServer(app);
const socketio = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
});

let boards: Boards = new Boards(socketio)

app.post("/v1/board/create", (_, res: Response) => {
  res.send({ boardId: boards.createBoard() });
  return
});

app.post("/v1/board/join", (req: Request, res: Response) => {
  const body = req.body
  const board = boards.findBoard(body.boardId)
  if (!board) {
    res.send("Board does not exist").status(404);
    return
  }
  const userExists = board.findUser(body.username)
  if (!userExists) {
    board.createUser(body.username)
    res.send("Board is valid and username was added to board").status(200);
    return
  }
  res.send("Board and username is valid").status(200);
  return
});

app.post("/v1/board/validate", (req: Request, res: Response) => {
  const body = req.body
  const board = boards.findBoard(body.boardId)
  if (!board) {
    res.send("Board does not exist").status(404);
    return
  }
  res.send("Board is valid").status(200);
  return
});

socketio.listen(socketIoPort);
app.listen(httpPort, () => {
  console.log(`[server]: Server is running at http://localhost:${httpPort}`);
});
