import { Namespace, Socket } from "socket.io";

export interface User {
  name: Username;
  color: Color;
  position: CanvasCoordinateSet;
}

export enum Color {
  red,
  orange,
  yellow,
  lime,
  green,
  teal,
  brown,
  blue,
  purple,
  pink,
}

export type CommandId = number;
export type ColorName = string;
export type ColorString = string;
export type StrokeWidth = number;
export type Threshold = number;
export type SvgString = string;
export type BoardId = string;
export type Username = string;

export type CoordinateSet = {
  x: number;
  y: number;
};

export type CanvasCoordinateSet = CoordinateSet;

export interface Command {
  commandId: CommandId;
  owner: Username;
  done: Boolean;
  execute: (socket: Namespace | Socket) => void;
  undo: (socket: Namespace | Socket) => void;
  redo: (socket: Namespace | Socket) => void;
}
