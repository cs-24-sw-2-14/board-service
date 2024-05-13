import { Namespace } from "socket.io";
import { type PathNode, DrawCommand } from "./draw";
import {
  Command,
  CommandId,
  CanvasCoordinate,
  Threshold,
  Username,
} from "../types";

export class EraseCommand implements Command {
  commandId: CommandId;
  erasedCoordinates: PathNode[];
  stack: Map<CommandId, Command>;
  erasedCommandIds: CommandId[];
  owner: Username;
  threshold: Threshold;
  display: Boolean;
  constructor(
    commandId: CommandId,
    owner: Username,
    threshold: Threshold,
    stack: Map<CommandId, Command>,
  ) {
    this.commandId = commandId;
    this.erasedCoordinates = [];
    this.drawCommands = new Map();
    this.owner = owner;
    this.threshold = threshold;
  }

  eraseFromDrawCommands(
    drawCommands: DrawCommand[],
    coordinate: Coordinate,
    threshold: number,
  ) {
    drawCommands.forEach((drawCommand) => {
      if (!this.drawCommands.has(drawCommand.commandId)) {
        this.drawCommands.set(drawCommand.commandId, drawCommand);
      }
      let erasedCoordinates = drawCommand.drawing.path.eraseFromCoordinate(
        coordinate,
        threshold,
      );
      if (erasedCoordinates.length !== 0) {
        this.erasedCoordinates = this.erasedCoordinates.concat(
          this.erasedCoordinates,
          erasedCoordinates,
        );
      }
    });
  }

  execute(socket: Namespace) {
    this.erasedCoordinates.forEach((erasedCoordinate) => {
      erasedCoordinate.display = false;
    });
    this.drawCommands.forEach((drawCommand) => {
      drawCommand.execute(socket);
    });
  }

  undo(socket: Namespace) {
    this.erasedCoordinates.forEach((erasedCoordinate) => {
      erasedCoordinate.display = true;
    });
    this.drawCommands.forEach((drawCommand) => {
      drawCommand.execute(socket);
    });
  }
  redo(socket: Namespace) {
    this.execute(socket);
  }
}
