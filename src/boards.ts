import { Server, Namespace, Socket } from "socket.io";
import { DrawCommand } from "./commands/draw";
import { EraseCommand } from "./commands/erase";
import { CommandController } from "./commandController";
import { MoveCommand } from "./commands/move";
import { User, BoardId, CommandId, Username } from "./types";
import {
  StartAck,
  StartDrawEvent,
  DoDrawEvent,
  StartEraseEvent,
  DoEraseEvent,
  StartMoveEvent,
  DoMoveEvent,
  UserChangeEvent,
  ClientToServerEvents,
  ServerToClientEvents,
  InitServerToClientEvents,
  SocketData,
  RedoEvent,
  UndoEvent,
  DoTextEvent,
  StartTextEvent,
} from "./socketioInterfaces";
import { TextCommand, Text } from "./commands/text";

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
  initNamespace: Namespace<InitServerToClientEvents>;
  users: Map<Username, User>;
  currentCommandId: CommandId;
  controller: CommandController;
  constructor(socketio: Server, boardID: string) {
    this.boardId = boardID;
    this.namespace = socketio.of("/" + this.boardId);
    this.initNamespace = socketio.of("/" + this.boardId + "_init");
    this.users = new Map();
    this.currentCommandId = 0;
    this.controller = new CommandController(this.namespace);

    // Register middleware to perform 'authentication' on every incoming connection.
    this.namespace.use((socket, next) => {
      const username = socket.handshake.auth.username;
      const color = socket.handshake.auth.color;
      if (this.users.has(username)) {
        next(new Error("Username Already Taken"));
      }
      for (const [_, user] of this.users) {
        if (user.color === color) {
          next(new Error("Color Already Taken"));
        }
      }
      this.users.set(username, {
        name: username,
        color: color,
        position: { x: 0, y: 0 },
      });

      socket.data.username = username;
      next();
    });

    // If connection is successful, bind functions to events
    this.initNamespace.on("connection", (socket) => this.getUsers(socket));

    // If connection is successful, bind functions to events
    this.namespace.on("connection", (socket) => {
      socket.on("startDraw", this.handleStartDraw.bind(this));
      socket.on("doDraw", this.handleDoDraw.bind(this));
      socket.on("startErase", this.handleStartErase.bind(this));
      socket.on("doErase", this.handleDoErase.bind(this));
      socket.on("startText", this.handleStartText.bind(this));
      socket.on("doText", this.handleDoText.bind(this));
      socket.on("startMove", this.handleStartMove.bind(this));
      socket.on("doMove", this.handleDoMove.bind(this));
      socket.on("undo", this.handleUndo.bind(this));
      socket.on("redo", this.handleRedo.bind(this));
      socket.on("userChange", this.handleUserChange.bind(this));
      this.getCommandStack(socket);
      socket.on("disconnect", () => {
        // remove the user from the hashmap when they disconnect
        this.users.delete(socket.data.username);
        // send changes to clients
        this.namespace.emit("userRemove", {
          username: socket.data.username,
        });
        this.initNamespace.emit("userRemove", {
          username: socket.data.username,
        });
      });
    });
  }

  getCommandStack(socket: Socket | Namespace) {
    for (const [_, command] of this.controller.stack) {
      if (!command.done) continue;
      command.execute(socket);
    }
  }

  getUsers(socket: Socket | Namespace) {
    for (const [username, user] of this.users) {
      socket.emit("userChange", {
        username: username,
        color: user.color,
        position: user.position,
      });
    }
  }

  /**
   * Creates a DrawCommand and executes it
   * Sends acknowledgement back to client via supplied callback function, containing the new commandId
   * @param data, of interface StartDraw
   * @param callback, of interface StartAck
   */
  handleStartDraw(data: StartDrawEvent, callback: StartAck) {
    const command = new DrawCommand(
      this.currentCommandId++,
      data.username,
      data.position,
      data.stroke,
      data.fill,
      data.strokeWidth,
    );
    this.controller.execute(command, data.username);
    callback(command.commandId);
  }

  /**
   * Edits a DrawCommand, and executes it, to send changes to clients
   * @param data, of interface DoDraw
   */
  handleDoDraw(data: DoDrawEvent) {
    const drawCommand = this.controller.stack.get(
      data.commandId,
    ) as DrawCommand;
    if (!drawCommand) return;
    drawCommand.path.add(data.position);
    drawCommand.execute(this.namespace);
  }

  /**
   * Creates a EraseCommand and executes it
   * Sends acknowledgement back to client via supplied callback function, containing the new commandId
   * @param data, of interface StartErase
   * @param callback, of interface StartAck
   */
  handleStartErase(data: StartEraseEvent, callback: StartAck) {
    const command = new EraseCommand(
      this.currentCommandId++,
      data.username,
      data.threshold,
      this.controller.stack,
    );

    command.eraseFromDrawCommands(data.commandIdsUnderCursor, data.position);

    this.controller.execute(command, data.username);
    callback(command.commandId);
  }

  /**
   * Edits a EraseCommand, and executes it, to send changes to clients
   * @param data, of interface DoErase
   */
  handleDoErase(data: DoEraseEvent) {
    const eraseCommand = this.controller.stack.get(
      data.commandId,
    ) as EraseCommand;
    eraseCommand.eraseFromDrawCommands(
      data.commandIdsUnderCursor,
      data.position,
    );
    eraseCommand.execute(this.namespace);
  }

  /**
   * Creates a MoveCommand and executes it
   * Sends acknowledgement back to client via supplied callback function, containing the new commandId
   * @param data, of interface StartMove
   * @param callback, of interface StartAck
   */
  handleStartMove(data: StartMoveEvent, callback: StartAck) {
    const command = new MoveCommand(
      this.currentCommandId++,
      data.username,
      { x: 0, y: 0 },
      this.controller.stack.get(data.movedCommandId) as DrawCommand,
    );
    this.controller.execute(command, data.username);
    callback(command.commandId);
  }
  handleStartText(data: StartTextEvent, callback: StartAck) {
    const text = new Text(data.position, "");
    const command = new TextCommand(
      this.currentCommandId++,
      text,
      data.username,
    );

    this.controller.execute(command, data.username);
    callback(command.commandId);
  }

  handleDoText(data: DoTextEvent) {
    if (!this.controller.stack.has(data.commandId)) return;
    const textCommand = this.controller.stack.get(
      data.commandId,
    )! as TextCommand;
    textCommand.text.content = data.content;
    textCommand.execute(this.namespace);
  }

  /**
   * Edits a MoveCommand, and executes it, to send changes to clients
   * @param data, of interface DoMove
   */
  handleDoMove(data: DoMoveEvent) {
    if (!this.controller.stack.get(data.commandId)) return;
    const moveCommand = this.controller.stack.get(
      data.commandId,
    )! as MoveCommand;
    moveCommand.movedOffset = data.position;
    moveCommand.execute(this.namespace);
  }

  /**
   * Executes the undo action for the given user
   * @param data, of interface Undo
   */
  handleUndo(data: UndoEvent) {
    this.controller.undo(data.username);
  }

  /**
   * Executes the redo action for the given user
   * @param data, of interface Redo
   */
  handleRedo(data: RedoEvent) {
    this.controller.redo(data.username);
  }

  /**
   * Updates the users on the board and sends changes to clients
   * @param data, of interface UserChange
   */
  handleUserChange(data: UserChangeEvent) {
    if (!this.users.has(data.username)) return;
    const user = this.users.get(data.username);
    user!.color = data.color ?? user!.color;
    user!.position = data.position ?? user!.position;
    this.namespace.emit("userChange", data);
    this.initNamespace.emit("userChange", data);
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
