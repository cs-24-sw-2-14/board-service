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
export const server = createServer(app);
export const socketio = new Server(server, {
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
  res.send({ board_id: boards.createBoard() });
  return;
});

app.get("/v1/board/exists", (req: Request, res: Response) => {
  const boardId = req.query.board_id as BoardId;

  if (boardId === undefined) {
    res.status(400).send("<p>Parameter missing: board_id</p>");
    return;
  }

  res.status(200).send(boards.boards.has(boardId));
  return;
});

app.get("/v1/user/exists", (req: Request, res: Response) => {
  const boardId = req.query.board_id as BoardId;

  if (boardId === undefined) {
    res.status(400).send("<p>Parameter missing: board_id</p>");
    return;
  }

  const username = req.query.username as Username;

  if (username === undefined) {
    res.status(400).send("<p>Parameter missing: username</p>");
    return;
  }

  const board = boards.boards.get(boardId);

  if (board === undefined) {
    res.status(404).send("Board does not exist");
    return;
  }

  res.status(200).send(board.users.has(username));
  return;
});

app.get("/v1/color/exists", (req: Request, res: Response) => {
  const boardId = req.query.board_id as BoardId;

  if (boardId === undefined) {
    res.status(400).send("<p>Parameter missing: board_id</p>");
    return;
  }

  const colorstring = req.query.color as string;

  if (colorstring === undefined) {
    res.status(400).send("<p>Parameter missing: color</p>");
    return;
  }

  const color = parseInt(colorstring) as Color;

  const board = boards.boards.get(boardId);

  if (board === undefined) {
    res.status(404).send("Board does not exist");
    return;
  }

  for (const [_, user] of board.users) {
    if (user.color === color) {
      res.status(200).send(true);
      return;
    }
  }
  res.status(200).send(false);
});

server.listen(PORT, () => {
  console.log(`[server]: Server is running`);
});
