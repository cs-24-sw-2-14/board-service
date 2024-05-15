import express, { Request, Response } from "express";
import { createServer } from "node:http";
var cors = require("cors");
import { Server } from "socket.io";
import { Boards } from "./boards";
const PORT = 5123;

var corsOptions = {
  origin: "*",
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
const server = createServer(app);
const socketio = new Server(server, {
  cors: {
    origin: "*",
  },
});
let boards: Boards = new Boards(socketio);

/**
 * Creates a new board
 * @returns boardId - The unique id identifying the new board created
 */
app.post("/v1/board/create", (_, res: Response) => {
  res.send({ boardId: boards.createBoard() });
  return;
});

app.post("/v1/board/validateBoardId", (req: Request, res: Response) => {
  const body = req.body;
  if (!boards.boards.has(body.boardId)) {
    res.status(404).send("Board does not exist");
    return;
  }
  res.status(200).send("Board is valid");
  return;
});

app.post("/v1/board/validateUsername", (req: Request, res: Response) => {
  const body = req.body;
  if (body.boardId === undefined || body.username === undefined) {
    res.status(400).send("Bad Request: Missing boardId or username");
    return;
  }
  if (!boards.boards.has(body.boardId)) {
    res.status(400).send("Bad Request: Board does not exist");
    return;
  }
  const board = boards.boards.get(body.boardId)!;

  if (board.users.has(body.username)) {
    res.status(409).send("Conflict: Username is Already taken");
    return;
  }
  res.status(200).send("Username is available");
});

app.post("/v1/board/validateColor", (req: Request, res: Response) => {
  const body = req.body;
  if (body.boardId === undefined || body.color === undefined) {
    res.status(400).send("Bad Request: Missing boardId or color");
    return;
  }
  if (!boards.boards.has(body.boardId)) {
    res.status(400).send("Bad Request: Board does not exist");
    return;
  }
  const board = boards.boards.get(body.boardId)!;

  for (const user of board.users) {
    if (user[1].color === body.color) {
      res.status(409).send("Conflict: Color is Already taken");
      return;
    }
  }
  res.status(200).send("Color is available");
});

server.listen(PORT, () => {
  console.log(`[server]: Server is running`);
});
