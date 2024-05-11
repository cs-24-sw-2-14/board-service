import { Server, Namespace } from "socket.io";
import { Drawing, DrawCommand, CoordinateType } from "./commands/draw";
import { EraseCommand } from "./commands/erase";
import { Text, TextCommand } from './commands/text';
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
      socket.on("startText", this.handleStartText.bind(this));
      socket.on("doText", this.handleDoText.bind(this));
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
    this.controller.execute(command, data.username);
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
    drawCommand.drawing.path.add({
      x: data.x,
      y: data.y,
      type: CoordinateType.lineto,
    });
    drawCommand.execute(this.namespace);
  }

  handleStartErase(data: any) {
    const drawCommands = this.controller.undoStack.filter(
      (command): command is DrawCommand =>
        data.commandIds.includes(command.commandId),
    );
    if (drawCommands.length === 0) return; // No valid draw commands found, exit

    const command = new EraseCommand(
      this.currentId++,
      data.username,
      data.threshold,
    );

    command.eraseFromDrawCommands(
      drawCommands,
      data.coordinate,
      data.threshold,
    );

    this.controller.execute(command, data.username);
    this.namespace.emit("startEraseSuccess", {
      commandId: command.commandId,
      username: data.username,
    });
  }

  handleDoErase(data: any) {
    console.log("doErase");
    const eraseCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as EraseCommand;
    console.log("DE0");

    if (!eraseCommand) return; // No valid erase command found, exit

    const drawCommands = this.controller.undoStack.filter(
      (command): command is DrawCommand =>
        data.commandIds.includes(command.commandId),
    );
    if (drawCommands.length === 0) return; // No valid draw commands found, exit

    console.log("DE1");
    eraseCommand.eraseFromDrawCommands(
      drawCommands,
      data.coordinate,
      data.threshold,
    );

    eraseCommand.execute(this.namespace);
    console.log("DE2");
  }

  handleStartText(data: any) {
    const text = new Text(
      data.placement,
      "",
    );
    const command = new TextCommand(this.currentId++, text, data.username);
    this.controller.execute(command, data.username);
    this.namespace.emit("startTextSuccess", {
      commandId: command.commandId,
      username: data.username,
    });
  }

  handleDoText(data: any) {
    const textCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as TextCommand;
    if (!textCommand) return;
    textCommand.text.content = data.content;
    textCommand.execute(this.namespace);
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
    while (true) {
      let boardId = Array.from({ length: 6 }, () => {
        return Math.ceil(Math.random() * 15)
          .toString(16)
          .toUpperCase();
      }).join("");

      if (!this.findBoard(boardId)) return boardId;
    }
  }

  createBoard() {
    let boardId = this.generateBoardID();
    this.boards.push(new Board(this.socketio, boardId));
    return boardId;
  }
}
