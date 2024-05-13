import { Server, Namespace } from "socket.io";
import { DrawCommand } from "./commands/draw";
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
  boardId: BoardId;
  namespace: Namespace<ClientToServerEvents, ServerToClientEvents, SocketData>;
  users: Map<Username, User>;
  currentCommandId: CommandId;
  controller: CommandController;
  constructor(socketio: Server, boardID: string) {
    this.boardId = boardID;
    this.namespace = socketio.of("/" + this.boardId);
    this.users = new Map();
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

  /**
   * Edits a DrawCommand, and executes it, to send changes to clients
   * @param data, of interface DoDraw
   */
  handleDoDraw(data: DoDraw) {
    const drawCommand = this.controller.stack.get(
      data.commandId,
    ) as DrawCommand;
    if (!drawCommand) return;
    drawCommand.path.add(data.coordinate);
    drawCommand.execute(this.namespace);
  }

  /**
   * Creates a EraseCommand and executes it
   * Sends acknowledgement back to client via supplied callback function, containing the new commandId
   * @param data, of interface StartErase
   * @param callback, of interface StartAck
   */
  handleStartErase(data: StartErase, callback: StartAck) {
    const command = new EraseCommand(
      this.currentCommandId++,
      data.username,
      data.threshold,
      this.controller.stack,
    );

    command.eraseFromDrawCommands(data.commandIdsUnderCursor, data.coordinate);

    this.controller.execute(command, data.username);
    this.namespace.emit("startEraseSuccess", {
      commandId: command.commandId,
      username: data.username,
    });
  }

  /**
   * Edits a EraseCommand, and executes it, to send changes to clients
   * @param data, of interface DoErase
   */
  handleDoErase(data: DoErase) {
    const eraseCommand = this.controller.stack.get(
      data.commandId,
    ) as EraseCommand;
    eraseCommand.eraseFromDrawCommands(
      data.commandIdsUnderCursor,
      data.coordinate,
    );
    eraseCommand.execute(this.namespace);
  }

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

  /**
   * Edits a MoveCommand, and executes it, to send changes to clients
   * @param data, of interface DoMove
   */
  handleDoMove(data: DoMove) {
    if (!this.controller.stack.get(data.commandId)) return;
    const moveCommand = this.controller.stack.get(
      data.commandId,
    )! as MoveCommand;
    moveCommand.movedOffset = data.offset;
    moveCommand.execute(this.namespace);
  }

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
}

/**
 * Represents multiple boards
 * Is responsible for the creation of new boards
 * @param boards - Hashmap which maps a BoardId to a Board
 * @param socketio - socketio server instance, which is passed to the boards
 */
export class Boards {
  boards: Map<BoardId, Board>;
  socketio: Server;
  constructor(socketio: Server) {
    this.socketio = socketio;
    this.boards = new Map();
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

      if (!this.boards.has(boardId)) return boardId;
    }
  }

  /**
   * Creates a new board and adds it to the hashmap of boards
   * @returns the new added boardId
   */
  createBoard() {
    let boardId = this.generateBoardID();
    this.boards.set(boardId, new Board(this.socketio, boardId));
    return boardId;
  }
}
