import { Server, Namespace } from "socket.io";
import { Drawing, DrawCommand, CoordinateType } from "./commands/draw";
import { EraseCommand } from "./commands/erase";
import { CommandController } from "./commandController";

export type User = {
  username: string;
};

export class Board {
  boardId: string;
  namespace: Namespace;
  users: User[];
  currentId: number;
  controller: CommandController;
  constructor(socketio: Server, boardID: string) {
    this.boardId = boardID;
    this.users = [];
    this.currentId = 0;
    this.namespace = socketio.of("/" + this.boardId);
    this.controller = new CommandController(this.namespace);
    this.namespace.on("connection", (socket) => {
      socket.on("startDraw", this.handleStartDraw.bind(this));
      socket.on("doDraw", this.handleDoDraw.bind(this));
      socket.on("startErase", this.handleStartErase.bind(this));
      socket.on("doErase", this.handleDoErase.bind(this));
      socket.on("undo", this.handleUndo.bind(this));
      socket.on("redo", this.handleRedo.bind(this));
    });
    console.log("New board created with id: " + this.boardId);
  }

  handleStartDraw(data: any) {
    const drawing = new Drawing(
      data.placement,
      data.path,
      data.stroke,
      data.fill,
      data.strokeWidth,
    );
    const command = new DrawCommand(this.currentId++, drawing, data.username);
    this.controller.execute(command);
    this.namespace.emit("startDrawSuccess", {
      commandId: command.commandId,
      username: data.username,
    });
  }

  handleDoDraw(data: any) {
    const drawCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as DrawCommand;
    if (!drawCommand) return;
    drawCommand.drawing.path.push({
      x: data.x,
      y: data.y,
      type: CoordinateType.lineto,
    });
    drawCommand.execute(this.namespace);
  }

  // BUG: Sometimes an invalid drawCommand is added to the list of drawCommands
  handleStartErase(data: any) {
    const drawCommands = this.controller.undoStack.filter(
      (command): command is DrawCommand =>
        data.commandIds.includes(command.commandId),
    );
    if (drawCommands.length === 0) return; // No valid draw commands found, exit

    const command = new EraseCommand(
      this.currentId++,
      data.username,
      drawCommands,
      data.threshold,
      [
        {
          x: data.coordinate.x,
          y: data.coordinate.y,
        },
      ],
    );

    this.controller.execute(command);
    this.namespace.emit("startEraseSuccess", {
      commandId: command.commandId,
      username: data.username,
    });
  }

  // BUG: Sometimes an invalid drawCommand is added to the list of drawCommands
  handleDoErase(data: any) {
    const eraseCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as EraseCommand;
    if (!eraseCommand) return; // No valid erase command found, exit

    // Filter out draw commands that are already erased
    const newDrawCommands = data.commandIds.filter((commandId: number) => {
      return !eraseCommand.drawCommands.some(
        (drawCommand) => drawCommand.commandId === commandId,
      );
    });

    eraseCommand.drawCommands =
      eraseCommand.drawCommands.concat(newDrawCommands);

    eraseCommand.erasePath.push({ x: data.coordinate.x, y: data.coordinate.y });

    eraseCommand.execute(this.namespace);
  }

  // TODO: Implement Move Functionality

  handleUndo(data: any) {
    // if (!this.findUser(data.username)) return
    this.controller.undo(data.username);
  }

  handleRedo(data: any) {
    // if (!this.findUser(data.username)) return
    this.controller.redo(data.username);
  }

  createUser(username: string) {
    if (this.findUser(username) === undefined) return;
    this.users.push({ username: username });
  }

  findUser(username: string) {
    return this.users.find((user) => user.username === username);
  }
}

export class Boards {
  boards: Board[];
  socketio: Server;
  constructor(socketio: Server) {
    this.socketio = socketio;
    this.boards = [];
  }

  findBoard(boardId: string) {
    return this.boards.find((board) => board.boardId === boardId);
  }

  generateBoardID() {
    // while (true) {
    //   let boardId = Array.from({ length: 6 }, () => {
    //     return Math.ceil(Math.random() * 15).toString(16).toUpperCase();
    //   }).join("");
    //
    //   if (!this.findBoard(boardId)) return boardId;
    // }
    return "123456";
  }

  createBoard() {
    let boardId = this.generateBoardID();
    this.boards.push(new Board(this.socketio, boardId));
    return boardId;
  }
}
