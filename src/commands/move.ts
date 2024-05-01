import { Namespace } from "socket.io"
import { CommandInterface } from "../commandController"

// TODO: Move shared types to shared types file
export interface Coordinate {
  x: number;
  y: number;
}

export class MoveCommand implements CommandInterface {
  commandId: number
  owner: string
  movedCommandId: number
  newCoordinate: Coordinate
  oldCoordinate: Coordinate
  constructor(commandId: number, movedCommandId: number, owner: string, newCoordinate: Coordinate, oldCoordinate: Coordinate) {
    this.commandId = commandId;
    this.owner = owner
    this.movedCommandId = movedCommandId
    this.newCoordinate = newCoordinate
    this.oldCoordinate = oldCoordinate
  }
  execute(socket: Namespace) {
    socket.emit("edit", {
      x: this.newCoordinate.x,
      y: this.newCoordinate.y,
      commandId: this.movedCommandId
    })
  }
  undo(socket: Namespace) {
    socket.emit("remove", {
      commandId: this.commandId
    })
  }
  redo(socket: Namespace) {
    this.execute(socket)
  }
}

