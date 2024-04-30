import { Server } from "socket.io";

type User = {
  id: number;
  name: string;
  isOnline: boolean;
}

enum CommandType { Add, Replace, Remove, Undo, Redo }

type Command = {
  owner: User;
  command: string;
  type: CommandType
}

export class Board {
  boardId: string;
  namespace;
  commandStack: Command[];
  users: User[];
  constructor(socketio: Server, boardID: string) {
    this.boardId = boardID;
    this.commandStack = []
    this.users = []
    this.namespace = socketio.of(this.boardId);
    this.namespace.on("command", this.handleCommand)
  }
  handleCommand(command: string) {
    this.commandStack.push(JSON.parse(command))
    this.namespace.emit(command)
  }

  createUser() {
    return this.users.push() - 1
  }
}

export class Boards {
  boards: Board[];
  socketio: Server;
  constructor(socketio: Server) {
    this.socketio = socketio
    this.boards = []
  }

  doesBoardExist(boardId: string) {
    return this.boards.find((board) => board.boardId === boardId);
  }

  generateBoardID() {
    let maxBoardId = "000000"
    this.boards.forEach((board) => {
      maxBoardId = board.boardId > maxBoardId ? board.boardId : maxBoardId
    })
    return maxBoardId;
  }

  createBoard() {
    let boardId = this.generateBoardID()
    this.boards.push(new Board(this.socketio, boardId))
    return boardId
  }

}
