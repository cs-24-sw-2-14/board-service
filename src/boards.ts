import { Server, Namespace } from "socket.io";
import { Drawing, DrawCommand, CoordinateType } from "./commands/draw"
import { CommandController } from "./commandController"

export class User {
  username: string
  constructor(username: string) {
    this.username = username
  }
}

export class Board {
  boardId: string;
  namespace: Namespace;
  users: User[];
  currentId: number
  controller: CommandController
  constructor(socketio: Server, boardID: string) {
    this.boardId = boardID;
    this.users = []
    this.currentId = 0
    this.namespace = socketio.of(this.boardId);
    this.controller = new CommandController(this.namespace)
    this.namespace.on("startDraw", this.handleStartDraw)
    this.namespace.on("doDraw", this.handleDoDraw)
    this.namespace.on("undo", this.handleUndo)
    this.namespace.on("redo", this.handleRedo)
  }

  handleStartDraw(data: any) {
    const drawing = new Drawing(data.placement, data.path, data.stroke, data.fill, data.strokeWidth)
    const command = new DrawCommand(this.currentId++, drawing, data.username)
    this.controller.execute(command)
  }

  handleDoDraw(data: any) {
    const commandIndex = this.controller.undoStack.findIndex((command) => command.commandId === data.commandId)
    if (!commandIndex) return
    if ("drawing" in this.controller.undoStack[commandIndex])
      (this.controller.undoStack[commandIndex] as DrawCommand).drawing.path.push({
        x: data.x,
        y: data.y,
        type: CoordinateType.lineto
      })
    this.controller.undoStack[commandIndex].execute(this.namespace)
  }

  // handleStartMove(data: any) {
  //   const command = new MoveCommand(this.currentId++, =, data.username)
  //   this.controller.execute(command)
  // }
  //
  // handleDoMove(data: any) {
  //   const commandIndex = this.controller.undoStack.findIndex((command) => command.commandId === data.commandId)
  //   if (!commandIndex) return
  //   this.controller.undoStack[commandIndex].command.path.push({
  //     x: data.x,
  //     y: data.y,
  //     type: CoordinateType.lineto
  //   })
  //   this.controller.undoStack[commandIndex].execute(this.namespace)
  // }

  handleUndo(data: any) {
    if (!this.findUser(data.username)) return
    this.controller.undo(data.username)
  }

  handleRedo(data: any) {
    if (!this.findUser(data.username)) return
    this.controller.redo(data.username)
  }

  createUser(username: string) {
    if (this.findUser(username) === undefined) return
    this.users.push(new User(username))
  }

  findUser(username: string) {
    return this.users.find((user) => user.username === username)
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
