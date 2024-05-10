import { Namespace } from "socket.io";
import { CommandInterface } from "../commandController";
import { Coordinate } from "../types";

export class MoveCommand implements CommandInterface {
  commandId: number;
  owner: string;
  deltaCoordinate: Coordinate;
  originalCoordinate: Coordinate;
  movedCommandId: number;
  constructor(
    commandId: number,
    owner: string,
    deltaCoordinate: Coordinate,
    originalCoordinate: Coordinate,
    movedCommandId: number,
  ) {
    this.commandId = commandId;
    this.owner = owner;
    this.deltaCoordinate = deltaCoordinate;
    this.originalCoordinate = originalCoordinate;
    this.movedCommandId = movedCommandId;
  }
  execute(socket: Namespace) {
    socket.emit("edit", {
      x: this.originalCoordinate.x + this.deltaCoordinate.x,
      y: this.originalCoordinate.y + this.deltaCoordinate.y,
      commandId: this.movedCommandId,
    });
  }
  undo(socket: Namespace) {
    socket.emit("edit", {
      x: this.originalCoordinate.x,
      y: this.originalCoordinate.y,
      commandId: this.movedCommandId,
    });
  }
  redo(socket: Namespace) {
    this.execute(socket);
  }
}
