import { Namespace } from "socket.io";
import { Command, CommandId, Username, CanvasCoordinate } from "../types";
import { DrawCommand } from "./draw";

/**
 * Represents an MoveCommand, which moves a commands placement
 * @attribute commandId - the commandId identifying the command
 * @attribute owner - owner of the command
 * @attribute movedOffset - the offset to move the moved command
 * @attribute oldCoordinate - the old placement of the moved command
 * @attribute movedCommandId - the commandId of the moved command
 * @attribute display -  threshold
 */
export class MoveCommand implements Command {
  commandId: CommandId;
  owner: Username;
  movedOffset: CanvasCoordinate;
  oldCoordinate: CanvasCoordinate;
  movedCommand: DrawCommand;
  display: Boolean;
  constructor(
    commandId: CommandId,
    owner: Username,
    movedOffset: CanvasCoordinate,
    movedCommand: DrawCommand,
  ) {
    this.commandId = commandId;
    this.owner = owner;
    this.movedOffset = movedOffset ?? { x: 0, y: 0 };
    this.oldCoordinate = movedCommand.position;
    this.movedCommand = movedCommand;
    this.display = true;
  }
  execute(socket: Namespace) {
    this.movedCommand.position = {
      x: this.oldCoordinate.x + this.movedOffset.x,
      y: this.oldCoordinate.y + this.movedOffset.y,
    };
    this.movedCommand.execute(socket);
  }
  undo(socket: Namespace) {
    this.movedCommand.position = this.oldCoordinate;
    this.movedCommand.execute(socket);
  }
  redo(socket: Namespace) {
    this.execute(socket);
  }
}
