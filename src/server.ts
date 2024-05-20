import express, { Request, Response } from "express";
import { createServer } from "node:http";
var cors = require("cors");
import { Server } from "socket.io";
import { Boards } from "./boards";
import { BoardId, Username } from "./types";
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

app.get("/v1/board/exists", (req: Request, res: Response) => {
  if (!req.params.board_id){
    res.status(400).send("Missing parameter: board_id")
    return;
  }

  res.status(200).send(boards.boards.has(req.params.board_id));
  return;
});

app.get("/v1/user/exists", (req: Request, res: Response) => {
  const boardId = req.query.board_id as BoardId;

  if (boardId === undefined){
    res.status(400).send("<p>Parameter missing: boardId</p>");
    return;
  }

  const username = req.query.username as Username;

  if (username === undefined){
    res.status(400).send("<p>Parameter missing: username</p>");
    return;
  }

  const board = boards.boards.get(boardId);

  if(board === undefined){
    res.status(404).send("Board does not exist");
    return;
  }

  res.status(200).send(board.users.has(username));
  return;
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
