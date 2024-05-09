import { Namespace } from "socket.io";
import { CommandInterface } from "../commandController";
import { type PathNode, DrawCommand } from "./draw";
import { Coordinate } from "../types";


export class EraseCommand implements CommandInterface {
  commandId: number;
  erasedCoordinates: PathNode[];
  drawCommands: Map<number, DrawCommand>;
  owner: string;
  threshold: number;
  constructor(commandId: number, owner: string, threshold: number) {
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
    console.log("erase from drawCommands");
    drawCommands.forEach((drawCommand) => {
      console.log("erase from drawCommand:" + drawCommand.commandId);
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
    console.log("execute");
    this.erasedCoordinates.forEach((erasedCoordinate) => {
      erasedCoordinate.display = false;
    });
    this.drawCommands.forEach((drawCommand) => {
      drawCommand.execute(socket);
    });
  }

  undo(socket: Namespace) {
    console.log("undo");
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
