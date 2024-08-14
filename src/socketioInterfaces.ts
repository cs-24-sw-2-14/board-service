import type {
  CanvasCoordinateSet,
  ColorString,
  StrokeWidth,
  CommandId,
  Threshold,
  Username,
  SvgString,
  Color,
  TextString,
} from "./types";

export interface InitServerToClientEvents {
  userChange: (data: UserChangeEvent) => void;
  userRemove: (data: UserRemoveEvent) => void;
}

export interface ServerToClientEvents {
  edit: (data: EditEvent) => void;
  remove: (data: RemoveEvent) => void;
  userChange: (data: UserChangeEvent) => void;
  userRemove: (data: UserRemoveEvent) => void;
}

export interface ClientToServerEvents {
  startDraw: (data: StartDrawEvent, callback: StartAck) => void;
  doDraw: (data: DoDrawEvent) => void;
  startErase: (data: StartEraseEvent, callback: StartAck) => void;
  doErase: (data: DoEraseEvent) => void;
  startMove: (data: StartMoveEvent, callback: StartAck) => void;
  doMove: (data: DoMoveEvent) => void;
  startText: (data: StartTextEvent, callback: StartAck) => void;
  // The function startText takes data in the form of the interface StartTextEvent. 
  // When the first is done, then StartAck is called. StartAck returns void (nothing). 
  doText: (data: DoTextEvent) => void;
  // The function doText takes data in the form of the interface DoTextEvent and returns void (nothing). 
  undo: (data: UndoEvent) => void;
  redo: (data: RedoEvent) => void;
  userChange: (data: UserChangeEvent) => void;
}

export interface SocketData {
  username: Username;
}

export interface UserChangeEvent {
  username: Username;
  color?: Color;
  position?: CanvasCoordinateSet;
}

export interface UserRemoveEvent {
  username: Username;
}

export type StartAck = (commandId: CommandId) => void;

export interface StartDrawEvent {
  position: CanvasCoordinateSet;
  stroke: ColorString;
  fill: ColorString;
  strokeWidth: StrokeWidth;
  username: Username;
}

export interface DoDrawEvent {
  position: CanvasCoordinateSet;
  commandId: CommandId;
}

export interface StartEraseEvent {
  position: CanvasCoordinateSet;
  commandIdsUnderCursor: CommandId[];
  threshold: Threshold;
  username: Username;
}

export interface DoEraseEvent {
  position: CanvasCoordinateSet;
  commandIdsUnderCursor: CommandId[];
  commandId: CommandId;
}

export interface StartMoveEvent {
  movedCommandId: CommandId;
  username: Username;
}

export interface DoMoveEvent {
  position: CanvasCoordinateSet;
  commandId: CommandId;
}

export interface StartTextEvent {
  // Interface StartTextEvent consists of position and username. 
  position: CanvasCoordinateSet;
  // position is of the type CanvasCoordinateSet (number: x, y). 
  username: Username;
  // username is of the type Username (string). 
}

export interface DoTextEvent {
  // Interface DoTextEvent consists of commandId and content. 
  commandId: CommandId;
  // commandId is of the type CommandId (number). 
  content: TextString;
  // content is of the type string. 
}

export interface StartSuccessEvent {
  commandId: CommandId;
  username: Username;
}

export interface UndoEvent {
  username: Username;
}

export interface RedoEvent {
  username: Username;
}

export interface EditEvent {
  svgString?: SvgString;
  position?: CanvasCoordinateSet;
  commandId: CommandId;
}

export interface RemoveEvent {
  commandId: CommandId;
}
