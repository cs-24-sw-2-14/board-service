import { Namespace, Socket } from "socket.io";
import { type PathNode, DrawCommand } from "./draw";
import {
  Command,
  CommandId,
  CanvasCoordinateSet,
  Threshold,
  Username,
} from "../types";

/**
 * Represents an EraseCommand, which erases coordinates from a drawing
 * @attribute commandId - the commandId identifying the command
 * @attribute erasedCoordinates - array of references to the PathNodes, which are erased
 * @attribute stack - reference to the stack hashmap, allowing access to commands from their commandIds
 * @attribute erasedCommandIds - array of CommandIds, which are erased
 * @attribute owner - owner of the command
 * @attribute threshold - erase threshold
 * @attribute display -  threshold
 */
export class EraseCommand implements Command {
  commandId: CommandId;
  erasedCoordinates: PathNode[];
  stack: Map<CommandId, Command>;
  erasedCommandIds: CommandId[];
  owner: Username;
  threshold: Threshold;
  done: Boolean;
  constructor(
    commandId: CommandId,
    owner: Username,
    threshold: Threshold,
    stack: Map<CommandId, Command>,
  ) {
    this.commandId = commandId;
    this.erasedCoordinates = [];
    this.stack = stack;
    this.erasedCommandIds = [];
    this.owner = owner;
    this.threshold = threshold;
    this.done = true;
  }

  /**
   * 'Erases' a coordinate from a list of commandIds (by setting their display attribute to false)
   * @param commandIds - array of commandIds to be erased from
   * @param coordinate - coordinate to erase from commands
   */
  eraseFromDrawCommands(
    commandIds: CommandId[],
    coordinate: CanvasCoordinateSet,
  ) {
    let erasedCoordinates: PathNode[] = [];
    commandIds.forEach((commandId) => {
      if (!this.stack.has(commandId)) return;
      if (!this.erasedCommandIds.includes(commandId)) {
        this.erasedCommandIds.push(commandId);
      }
      let command = this.stack.get(commandId)! as DrawCommand;
      erasedCoordinates = command.path.eraseFromCoordinate(
        coordinate,
        this.threshold,
      );
    });
    if (erasedCoordinates.length !== 0) {
      this.erasedCoordinates = this.erasedCoordinates.concat(
        this.erasedCoordinates,
        erasedCoordinates,
      );
    }
  }

  execute(socket: Namespace | Socket, isVolatile: boolean) {
    this.update(socket, isVolatile, false);
  }

  undo(socket: Namespace | Socket, isVolatile: boolean) {
    this.update(socket, isVolatile, true);
  }
  redo(socket: Namespace | Socket, isVolatile: boolean) {
    this.execute(socket, isVolatile);
  }

  /**
   * Updates the display attribute of all the pathnodes and executes the
   * execute function on all affected drawCommands, to send changes to clients
   * @param socket - socketio namespace instance, used to be able to send events
   * @param state - the new display state
   */
  update(socket: Namespace | Socket, isVolatile: boolean, state: boolean) {
    this.erasedCoordinates.forEach((erasedCoordinate) => {
      erasedCoordinate.display = state;
    });
    this.erasedCommandIds.forEach((drawCommandId) => {
      this.stack.get(drawCommandId)?.execute(socket, isVolatile);
    });
  }
}
