import express, { Request, Response } from "express";
import { createServer } from "node:http";
var cors = require("cors");
import { Server } from "socket.io";
import { Boards } from "./boards";
import { BoardId, Color, Username } from "./types";
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

app.get("/v1/board/validateBoardId", (req: Request, res: Response) => {
  const boardId = req.query.boardId as BoardId;
  if (!boards.boards.has(boardId)) {
    res.status(404).send("Board does not exist");
    return;
  }
  res.status(200).send("Board is valid");
  return;
});

app.get("/v1/board/validateUsername", (req: Request, res: Response) => {
  const boardId = req.query.boardId as BoardId;
  const username = req.query.username as Username;
  if (boardId === undefined || username === undefined) {
    res.status(400).send("Bad Request: Missing boardId or username");
    return;
  }
  if (!boards.boards.has(boardId)) {
    res.status(400).send("Bad Request: Board does not exist");
    return;
  }
  const board = boards.boards.get(boardId)!;

  if (board.users.has(username)) {
    res.status(409).send("Conflict: Username is Already taken");
    return;
  }
  res.status(200).send("Username is available");
});

app.get("/v1/board/validateColor", (req: Request, res: Response) => {
  const boardId = req.query.boardId as BoardId;
  const colorString = req.query.color as string;

  if (boardId === undefined || colorString === undefined) {
    res.status(400).send("Bad Request: Missing boardId or color");
    return;
  }
  const color = parseInt(colorString);
  if (isNaN(color)) {
    res.status(400).send("Bad Request: Color format invalid");
    return;
  }

  if (!boards.boards.has(boardId)) {
    res.status(400).send("Bad Request: Board does not exist");
    return;
  }
  const board = boards.boards.get(boardId)!;

  for (const [_, user] of board.users) {
    if (user.color === color) {
      res.status(409).send("Conflict: Color is Already taken");
      return;
    }
  }
  res.status(200).send("Color is available");
});

server.listen(PORT, () => {
  console.log(`[server]: Server is running`);
});
