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

/**
 * Checks if a boardId already exists
 * @returns 404: if board does not exist
 * @returns 200: if board exists
 */
app.post("/v1/board/validate", (req: Request, res: Response) => {
  const body = req.body;
  if (!boards.boards.has(body.boardId)) {
    res.status(404).send("Board does not exist");
    return;
  }
  res.status(200).send("Board is valid");
  return;
});

server.listen(PORT, () => {
  console.log(`[server]: Server is running`);
});
