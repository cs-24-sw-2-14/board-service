import { Namespace, Socket } from "socket.io";
import {
  Command,
  CanvasCoordinateSet,
  CommandId,
  ColorString,
  StrokeWidth,
  Threshold,
  SvgString,
  Username,
} from "../types";
import { calculateDistance } from "../utils";

/**
 * Represents a Node in the linked list representing a svg Path
 * @param position - The CanvasCoordinate, where the Node is located
 * @param next - The PathNode in the linked list
 * @param display - Indicates whether the coordinate should be displayed when rendered
 */
export class PathNode {
  position: CanvasCoordinateSet;
  next: PathNode | null;
  display: boolean;
  constructor(position: CanvasCoordinateSet) {
    this.position = position;
    this.display = true;
    this.next = null;
  }
}

/**
 * Represents a Svg Path as linked list
 * @remark The linked list is the reversed version of the drawPath
 * @param head - The head of the linked list
 */
class DrawPath {
  head: PathNode | null;
  constructor() {
    this.head = null;
  }

  /**
   * Adds a coordinate as pathNode to the linked list
   * @param position - The new coordinate to be added
   */
  add(position: CanvasCoordinateSet) {
    let newNode = new PathNode(position);
    if (this.head === null) {
      this.head = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
  }

  /**
   * 'Erases' a coordinate (by settings display to false), from a coordinate and a threshold
   * @example if the distance from the given coordinate to a pathNode in the linked list
   * is lower than the threshold, the display property of that element is set to false
   * @param position - The coordinate in the center of the erased 'circle'
   * @param threshold - The radius of the erased 'circle'
   */
  eraseFromCoordinate(
    position: CanvasCoordinateSet,
    threshold: Threshold,
  ): PathNode[] {
    let erasedCoordinates = [];
    let curr: PathNode | null = this.head;
    while (curr?.next !== null) {
      if (
        curr!.display &&
        calculateDistance(position, curr!.position) <= threshold
      ) {
        curr!.display = false;
        erasedCoordinates.push(curr!);
      }
      curr = curr!.next;
    }
    return erasedCoordinates;
  }

  /**
   * Converts the linked list of PathNode's to a string
   * @example if the previous element (the next element in the linked list, since it represents the reversed svg path),
   * is not displayed, the coordinate type should be moveto, since it desired to render a gap when a coordinate is not displayed
   * @return the linked list converted to a svg pathstring
   */
  stringify(): SvgString {
    if (this.head === null) return "";
    let curr: PathNode | null = this.head;
    let pathString = "";
    while (curr?.next !== null) {
      if (curr.display) {
        if (curr.next.display) {
          pathString = `L${curr.position.x},${curr.position.y}` + pathString;
        } else {
          pathString = `M${curr.position.x},${curr.position.y}` + pathString;
        }
      }
      curr = curr.next;
    }
    if (curr !== null && curr.display) {
      pathString = `M${curr.position.x},${curr.position.y}` + pathString;
    }
    return pathString;
  }
}

/**
 * Represents a drawing
 * @param path - DrawPath object representing the svg path
 * @param stroke - The color of the drawings stroke
 * @param fill - the color to the path with, usually transparent, since no fill functionality is implemented
 * @param strokeWidth - The width of the stroke
 * @return the linked list converted to a svg pathstring
 */
class Drawing {
  path: DrawPath;
  stroke: ColorString;
  fill: ColorString;
  strokeWidth: StrokeWidth;
  constructor(
    initCoordinate: CanvasCoordinateSet,
    stroke: ColorString,
    fill: ColorString,
    strokeWidth: StrokeWidth,
  ) {
    this.path = new DrawPath();
    this.path.add(initCoordinate);
    this.strokeWidth = strokeWidth;
    this.fill = fill;
    this.stroke = stroke;
  }

  /**
   * Converts the drawing to an svg string
   * @return svg string, representing the drawing
   */
  stringify() {
    return `<path stroke='${this.stroke}' fill='${this.fill}' stroke-width='${this.strokeWidth}' d='${this.path.stringify()}' />`;
  }
}

/**
 * Represents a draw instruction
 * @param commandId - The commandId of the DrawCommand
 * @param owner - The user which created the command, therefore 'owning' it
 * @param initCoordinate - The first coordinate at which the drawing starts
 * @param stroke - The color of the drawings stroke
 * @param fill - the color to the path with, usually transparent, since no fill functionality is implemented
 * @param strokeWidth - The width of the stroke
 * @attribute offset - The offset of the command on the canvas
 * @attribute display - indicates whether the command should be displayed, initilized to true
 */
export class DrawCommand extends Drawing implements Command {
  commandId: CommandId;
  owner: Username;
  position: CanvasCoordinateSet;
  done: Boolean;
  constructor(
    commandId: CommandId,
    owner: Username,
    initCoordinate: CanvasCoordinateSet,
    stroke: ColorString,
    fill: ColorString,
    strokeWidth: StrokeWidth,
  ) {
    super(initCoordinate, stroke, fill, strokeWidth);
    this.commandId = commandId;
    this.owner = owner;
    this.position = { x: 0, y: 0 };
    this.done = true;
  }
  /**
   * Executes the DrawCommand, sending the changes to the clients
   * @param socket - namespace to send events on
   */
  execute(socket: Namespace | Socket) {
    socket.emit("edit", {
      svgString: this.stringify(),
      position: this.position,
      commandId: this.commandId,
    });
  }
  /**
   * Undos the DrawCommand by removing it from the clients
   * @param socket - namespace to send events on
   */
  undo(socket: Namespace | Socket) {
    socket.emit("remove", {
      commandId: this.commandId,
    });
  }
  /**
   * Redos the DrawCommand by invoking execute function
   * @param socket - namespace to send events on
   */
  redo(socket: Namespace | Socket) {
    this.execute(socket);
  }
}
