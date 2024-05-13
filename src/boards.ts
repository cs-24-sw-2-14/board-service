import { Server, Namespace } from "socket.io";
import { EraseCommand } from "./commands/erase";
import { MoveCommand } from "./commands/move";
import { User, BoardId, CommandId, Username } from "./types";
import {
  StartAck,
  StartDraw,
  DoDraw,
  StartErase,
  DoErase,
  StartMove,
  DoMove,
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  Redo,
  Undo,
} from "./socketioInterfaces";
import { CommandController } from "./commandController";

/**
 * Represents a Board, keeping track of its users and commands.
 * Listens to connection events for the namespace, and the different board events
 * Updates the clients with the 'edit' and 'remove' socketio events
 * @param boardId - The unique id identifying the board
 * @param namespace - socketio instance of the namespace, which here is the boardId
 * @param users - Hashmap of the users on the board
 * @param currentCommandId - The latest commandId which was used,
 * @param controller - The command controller, controlling the undo, redo and execution of commands
 */
export class Board {
  boardId: string;
  namespace: Namespace;
  users: User[];
  currentId: number;
  boardId: BoardId;
  namespace: Namespace<ClientToServerEvents, ServerToClientEvents, SocketData>;
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

  /**
   * Creates a DrawCommand and executes it
   * Sends acknowledgement back to client via supplied callback function, containing the new commandId
   * @param data, of interface StartDraw
   * @param callback, of interface StartAck
   */
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

    const drawCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
  /**
   * Edits a DrawCommand, and executes it, to send changes to clients
   * @param data, of interface DoDraw
   */
  handleDoDraw(data: DoDraw) {
    ) as DrawCommand;
    if (!drawCommand) return;
    drawCommand.drawing.path.add({
      x: data.x,
      y: data.y,
      type: CoordinateType.lineto,
    });
    drawCommand.execute(this.namespace);
  }

    const drawCommands = this.controller.undoStack.filter(
      (command): command is DrawCommand =>
        data.commandIds.includes(command.commandId),
    );
    if (drawCommands.length === 0) return; // No valid draw commands found, exit

  /**
   * Creates a EraseCommand and executes it
   * Sends acknowledgement back to client via supplied callback function, containing the new commandId
   * @param data, of interface StartErase
   * @param callback, of interface StartAck
   */
  handleStartErase(data: StartErase, callback: StartAck) {
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

    const eraseCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
  /**
   * Edits a EraseCommand, and executes it, to send changes to clients
   * @param data, of interface DoErase
   */
  handleDoErase(data: DoErase) {
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

    const drawCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as DrawCommand;
    if (!drawCommand) return;
  /**
   * Creates a MoveCommand and executes it
   * Sends acknowledgement back to client via supplied callback function, containing the new commandId
   * @param data, of interface StartMove
   * @param callback, of interface StartAck
   */
  handleStartMove(data: StartMove, callback: StartAck) {
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

    const moveCommand = this.controller.undoStack.find(
      (command) => command.commandId === data.commandId,
    ) as MoveCommand;
    if (!moveCommand) return;
    moveCommand.deltaCoordinate = data.deltaCoordinate;
  /**
   * Edits a MoveCommand, and executes it, to send changes to clients
   * @param data, of interface DoMove
   */
  handleDoMove(data: DoMove) {
    moveCommand.execute(this.namespace);
  }
  handleUndo(data: any) {
    // if (!this.findUser(data.username)) return
  /**
   * Executes the undo action for the given user
   * @param data, of interface Undo
   */
  handleUndo(data: Undo) {
    this.controller.undo(data.username);
  }

  /**
   * Executes the redo action for the given user
   * @param data, of interface Redo
   */
  handleRedo(data: Redo) {
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

/**
 * Represents multiple boards
 * Is responsible for the creation of new boards
 * @param boards - Hashmap which maps a BoardId to a Board
 * @param socketio - socketio server instance, which is passed to the boards
 */
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

  /**
   * Generates a random and unique BoardId
   * @returns Random and unique hexadecimal string of length 6
   */
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

  /**
   * Creates a new board and adds it to the hashmap of boards
   * @returns the new added boardId
   */
  createBoard() {
    let boardId = this.generateBoardID();
    this.boards.push(new Board(this.socketio, boardId));
    return boardId;
  }
}
