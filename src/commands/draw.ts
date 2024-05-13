import { Namespace } from "socket.io";
import {
  Command,
  CanvasCoordinate,
  CommandId,
  HexColorString,
  FillString,
  StrokeWidth,
  Threshold,
  SvgString,
  Username,
} from "../types";

export class PathNode {
  coordinate: CanvasCoordinate;
  next: PathNode | null;
  display: boolean;
  constructor(coordinate: CanvasCoordinate) {
    this.coordinate = coordinate;
    this.display = true;
    this.next = null;
  }
}

class DrawPath {
  head: PathNode | null;
  constructor() {
    this.head = null;
  }

  add(coordinate: CanvasCoordinate) {
    let newNode = new PathNode(coordinate);
    if (this.head === null) {
      this.head = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
  }

  // Function to calculate distance between two coordinates
  calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    return Math.sqrt(
      Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2),
    );
  }

  eraseFromCoordinate(
    coordinate: CanvasCoordinate,
    threshold: Threshold,
  ): PathNode[] {
    let erasedCoordinates = [];
    let curr: PathNode | null = this.head;
    while (curr?.next !== null) {
      if (this.calculateDistance(coordinate, curr!.coordinate) <= threshold) {
        curr!.display = false;
        erasedCoordinates.push(curr!);
      }
      curr = curr!.next;
    }
    return erasedCoordinates;
  }

  stringify(): SvgString {
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

class Drawing {
  path: DrawPath;
  stroke: HexColorString;
  fill: FillString;
  strokeWidth: StrokeWidth;
  constructor(
    placement: Coordinate,
    initCoordinate: CanvasCoordinate,
    stroke: HexColorString,
    fill: FillString,
    strokeWidth: StrokeWidth,
  ) {
    this.placement = placement;
    this.path = new DrawPath();
    this.path.add(initCoordinate);
    this.strokeWidth = strokeWidth;
    this.fill = fill;
    this.stroke = stroke;
  }

  // Function to calculate distance between two coordinates
  calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    return Math.sqrt(
      Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2),
    );
  }

  stringify() {
    return `<path stroke='${this.stroke}' fill='${this.fill}' stroke-width='${this.strokeWidth}' d='${this.path.stringify()}' />`;
  }
}

export class DrawCommand extends Drawing implements Command {
  commandId: CommandId;
  owner: Username;
  display: Boolean;
  constructor(
    commandId: CommandId,
    owner: Username,
    initCoordinate: CanvasCoordinate,
    stroke: HexColorString,
    fill: FillString,
    strokeWidth: StrokeWidth,
    this.commandId = commandId;
    this.owner = owner;
    this.display = true;
  }
  execute(socket: Namespace) {
    socket.emit("edit", {
      svgString: this.stringify(),
      placement: this.offset,
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
