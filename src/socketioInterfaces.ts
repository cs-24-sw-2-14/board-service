import type {
  CanvasCoordinateSet,
  ColorString,
  StrokeWidth,
  CommandId,
  Threshold,
  Username,
  SvgString,
  Color,
} from "./types";

export interface InitServerToClientEvents {
  userChange: (data: UserChange) => void;
  userRemove: (data: UserRemove) => void;
}

export interface ServerToClientEvents {
  edit: (data: Edit) => void;
  remove: (data: Remove) => void;
  userChange: (data: UserChange) => void;
  userRemove: (data: UserRemove) => void;
}

export interface ClientToServerEvents {
  startDraw: (data: StartDraw, callback: StartAck) => void;
  doDraw: (data: DoDraw) => void;
  startErase: (data: StartErase, callback: StartAck) => void;
  doErase: (data: DoErase) => void;
  startMove: (data: StartMove, callback: StartAck) => void;
  doMove: (data: DoMove) => void;
  startText: (data: StartTextEvent, callback: StartAck) => void;
  doText: (data: DoTextEvent, callback: StartAck) => void;
  undo: (data: Undo) => void;
  redo: (data: Redo) => void;
  userChange: (data: UserChange) => void;
}

export interface SocketData {
  username: Username;
}

export interface UserChange {
  username: Username;
  color?: Color;
  position?: CanvasCoordinateSet;
}

export interface UserRemove {
  username: Username;
}

export type StartAck = (commandId: CommandId) => void;

export interface StartDraw {
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
  position: CanvasCoordinateSet;
  username: Username;
}

export interface DoMoveEvent {
  position: CanvasCoordinateSet;
  commandId: CommandId;
}

export interface StartTextEvent {
  position: CanvasCoordinateSet;
  username: Username;
}

export interface DoTextEvent {
  content: string;

export interface StartSuccess {
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
