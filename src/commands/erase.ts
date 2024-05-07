import { Namespace } from "socket.io";
import { CommandInterface } from "../commandController";
import { Coordinate, CoordinateType, DrawCommand } from "./draw";

export class EraseCommand implements CommandInterface {
  commandId: number;
  drawCommands: DrawCommand[];
  owner: string;
  threshold: number;
  erasePath: Coordinate[];
  constructor(
    commandId: number,
    owner: string,
    drawCommands: DrawCommand[],
    threshold: number,
    erasePath: Coordinate[],
  ) {
    this.commandId = commandId;
    this.drawCommands = drawCommands;
    this.owner = owner;
    this.threshold = threshold;
    this.erasePath = erasePath;
  }
  execute(socket: Namespace) {
    console.log(this.drawCommands);
    this.drawCommands.forEach((drawCommand) => {
      // console.log(drawCommand);
      const index = drawCommand.drawing.erasePaths.findIndex((erasePath) => {
        return erasePath.commandId === this.commandId;
      });
      // if the erasePath does not exist, create it
      if (index === -1) {
        drawCommand.drawing.erasePaths.push({
          commandId: this.commandId,
          threshold: this.threshold,
          path: this.erasePath,
        });
        // if the erasePath exists, modify it
      } else {
        drawCommand.drawing.erasePaths[index] = {
          commandId: this.commandId,
          threshold: this.threshold,
          path: this.erasePath,
        };
      }
      drawCommand.execute(socket);
      socket.emit("edit", {
        svg: drawCommand.drawing.stringify(),
        commandId: drawCommand.commandId,
      });
    });
  }
  undo(socket: Namespace) {
    this.drawCommands.forEach((drawCommand) => {
      const index = drawCommand.drawing.erasePaths.findIndex((erasePath) => {
        return erasePath.commandId === this.commandId;
      });
      drawCommand.drawing.erasePaths.splice(index, 1);
      drawCommand.execute(socket);
    });
  }
  redo(socket: Namespace) {
    this.execute(socket);
  }
}
