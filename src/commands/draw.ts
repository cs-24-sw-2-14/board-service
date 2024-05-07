import { Namespace } from "socket.io";
import { CommandInterface } from "../commandController";

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

export interface ErasePath {
  path: Coordinate[];
  commandId: number;
  threshold: number;
}

export class Drawing {
  placement: Coordinate;
  path: PathCoordinate[];
  stroke: string;
  fill: string;
  strokeWidth: number;
  erasePaths: ErasePath[];
  constructor(
    placement: Coordinate,
    path: Coordinate,
    stroke: string,
    fill: string,
    strokeWidth: number,
  ) {
    this.placement = placement;
    this.path = [
      {
        type: CoordinateType.moveto,
        x: path.x,
        y: path.y,
      },
    ];
    this.strokeWidth = strokeWidth;
    this.fill = fill;
    this.stroke = stroke;
    this.erasePaths = [];
  }

  // Function to calculate distance between two coordinates
  calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    return Math.sqrt(
      Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2),
    );
  }

  stringifyPath() {
    let path = this.path.filter((drawCoord) => {
      // Check if the distance to any erase coordinate is greater than its threshold
      return !this.erasePaths.some((erasePath) =>
        erasePath.path.some(
          (eraseCoord) =>
            this.calculateDistance(eraseCoord, drawCoord) <=
            erasePath.threshold,
        ),
      );
    });

    return path
      .map((coordinate) => {
        if (coordinate.type === CoordinateType.moveto) {
          return `M${coordinate.x},${coordinate.y}`;
        } else {
          return `L${coordinate.x},${coordinate.y}`;
        }
      })
      .join("");
  }

  stringify() {
    return `<path stroke='${this.stroke}' fill='${this.fill}' stroke-width='${this.strokeWidth}' d='${this.stringifyPath()}' />`;
  }
}

export class DrawCommand implements CommandInterface {
  commandId: number;
  drawing: Drawing;
  owner: string;
  constructor(commandId: number, drawing: Drawing, owner: string) {
    this.commandId = commandId;
    this.drawing = drawing;
    this.owner = owner;
  }
  execute(socket: Namespace) {
    socket.emit("edit", {
      svg: this.drawing.stringify(),
      x: this.drawing.placement.x,
      y: this.drawing.placement.y,
      commandId: this.commandId,
    });
  }
  undo(socket: Namespace) {
    socket.emit("remove", {
      commandId: this.commandId,
    });
  }
  redo(socket: Namespace) {
    this.execute(socket);
  }
}
