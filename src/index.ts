import { Server } from "./server";
import { GenerateBoard } from "../utils/board-create"

console.log(GenerateBoard())
const server = new Server(8008);
server.StartServerAsync();
