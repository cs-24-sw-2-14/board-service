import { Namespace } from "socket.io"
import { CommandInterface } from "../commandController"

export enum CoordinateType {
  moveto,
  lineto,
}

// TODO: Move shared types to shared types file
export interface Coordinate {
  x: number;
  y: number;
}

export interface PathCoordinate extends Coordinate {
  type: CoordinateType;
}

export class Drawing {
  placement: Coordinate;
  path: PathCoordinate[];
  stroke: string;
  fill: string;
  strokeWidth: number;
  constructor(placement: Coordinate, path: PathCoordinate[], stroke: string, fill: string, strokeWidth: number) {
    this.placement = placement
    this.path = path
    this.strokeWidth = strokeWidth
    this.fill = fill
    this.stroke = stroke
  }

  stringifyPath() {
    return this.path.map((coordinate) => {
      if (coordinate.type === CoordinateType.moveto) {
        return `M${coordinate.x},${coordinate.y}`
      } else {
        return `L${coordinate.x},${coordinate.y}`
      }
    }).join("")
  }

  stringify() {
    return ""
  }
}

export class DrawCommand implements CommandInterface {
  commandId: number;
  drawing: Drawing;
  owner: string
  constructor(commandId: number, drawing: Drawing, owner: string) {
    this.commandId = commandId;
    this.drawing = drawing
    this.owner = owner
  }
  execute(socket: Namespace) {
    socket.emit("edit", {
      command: this.drawing.stringify(),
      x: this.drawing.placement.x,
      y: this.drawing.placement.y,
      commandId: this.commandId
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

