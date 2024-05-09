import { Namespace } from "socket.io";
import { CommandInterface } from "../commandController";
import { Coordinate } from "../types";

export enum CoordinateType {
  moveto,
  lineto,
}

interface PathCoordinate extends Coordinate {
  type: CoordinateType;
}

export class PathNode {
  coordinate: Coordinate;
  next: PathNode | null;
  display: boolean;
  constructor(coordinate: Coordinate) {
    this.coordinate = coordinate;
    this.display = true;
    this.next = null;
  }
}

// Function to calculate distance between two coordinates
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  return Math.sqrt(
    Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2),
  );
}

export class DrawPath {
  head: PathNode | null;
  constructor() {
    this.head = null;
  }

  add(pathCoordinate: PathCoordinate) {
    let newNode = new PathNode(pathCoordinate);
    if (this.head === null) {
      this.head = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
  }

  eraseFromCoordinate(coordinate: Coordinate, threshold: number): PathNode[] {
    let erasedCoordinates = [];
    let curr: PathNode | null = this.head;
    while (curr?.next !== null) {
      if (calculateDistance(coordinate, curr!.coordinate) <= threshold) {
        curr!.display = false;
        erasedCoordinates.push(curr!);
      }
      curr = curr!.next;
    }
    return erasedCoordinates;
  }

  stringify(): string {
    if (this.head === null) return "";
    let curr: PathNode | null = this.head;
    let pathString = "";
    while (curr?.next !== null) {
      if (curr.display) {
        if (curr.next.display) {
          pathString =
            `L${curr.coordinate.x},${curr.coordinate.y}` + pathString;
        } else {
          pathString =
            `M${curr.coordinate.x},${curr.coordinate.y}` + pathString;
        }
      }
      curr = curr.next;
    }
    if (curr !== null && curr.display) {
      pathString = `M${curr.coordinate.x},${curr.coordinate.y}` + pathString;
    }
    return pathString;
  }
}

export interface ErasePath {
  path: Coordinate[];
  commandId: number;
  threshold: number;
}

export class Drawing {
  placement: Coordinate;
  path: DrawPath;
  stroke: string;
  fill: string;
  strokeWidth: number;
  constructor(
    placement: Coordinate,
    initCoordinate: Coordinate,
    stroke: string,
    fill: string,
    strokeWidth: number,
  ) {
    this.placement = placement;
    this.path = new DrawPath();
    this.path.add({
      type: CoordinateType.moveto,
      x: initCoordinate.x,
      y: initCoordinate.y,
    });
    this.strokeWidth = strokeWidth;
    this.fill = fill;
    this.stroke = stroke;
  }

  stringify() {
    return `<path stroke='${this.stroke}' fill='${this.fill}' stroke-width='${this.strokeWidth}' d='${this.path.stringify()}' />`;
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
