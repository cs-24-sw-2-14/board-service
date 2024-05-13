import { Server, Namespace } from "socket.io";
import { EraseCommand } from "./commands/erase";
import { MoveCommand } from "./commands/move";
import { User, BoardId, CommandId, Username } from "./types";
import { CommandController } from "./commandController";

export class Board {
  boardId: string;
  namespace: Namespace;
  users: User[];
  currentId: number;
  boardId: BoardId;
  currentCommandId: CommandId;
  controller: CommandController;
  constructor(socketio: Server, boardID: string) {
    this.boardId = boardID;
    this.users = [];
    this.namespace = socketio.of("/" + this.boardId);
    this.currentCommandId = 0;
    this.controller = new CommandController(this.namespace);
    this.namespace.on("connection", (socket) => {
      socket.on("startDraw", this.handleStartDraw.bind(this));
      socket.on("doDraw", this.handleDoDraw.bind(this));
      socket.on("startErase", this.handleStartErase.bind(this));
      socket.on("doErase", this.handleDoErase.bind(this));
      socket.on("startMove", this.handleStartMove.bind(this));
      socket.on("doMove", this.handleDoMove.bind(this));
      socket.on("undo", this.handleUndo.bind(this));
      socket.on("redo", this.handleRedo.bind(this));
    });
  }

  handleStartDraw(data: StartDraw, callback: StartAck) {
    const command = new DrawCommand(
      this.currentCommandId++,
      data.username,
      data.coordinate,
      data.stroke,
      data.fill,
      data.strokeWidth,
    );
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

    command.eraseFromDrawCommands(data.commandIdsUnderCursor, data.coordinate);

    this.controller.execute(command, data.username);
    this.namespace.emit("startEraseSuccess", {
      commandId: command.commandId,
      username: data.username,
    });
  }

  handleDoErase(data: any) {
    const eraseCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as EraseCommand;

    if (!eraseCommand) return; // No valid erase command found, exit

    const drawCommands = this.controller.undoStack.filter(
      (command): command is DrawCommand =>
        data.commandIds.includes(command.commandId),
    );
    if (drawCommands.length === 0) return; // No valid draw commands found, exit

    eraseCommand.eraseFromDrawCommands(
      drawCommands,
      data.coordinate,
      data.threshold,
    );

    eraseCommand.execute(this.namespace);
  }

  handleStartMove(data: any) {
    const drawCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as DrawCommand;
    if (!drawCommand) return;
    const command = new MoveCommand(
      this.currentCommandId++,
      data.username,
      data.offset,
      this.controller.stack.get(data.movedCommandId) as DrawCommand,
    );
    this.controller.execute(command, data.username);
    this.namespace.emit("startMoveSuccess", {
      commandId: command.commandId,
      username: data.username,
    });
  }

  handleDoMove(data: any) {
    const moveCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as MoveCommand;
    if (!moveCommand) return;
    moveCommand.deltaCoordinate = data.deltaCoordinate;
    moveCommand.execute(this.namespace);
  }
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
