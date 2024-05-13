import { Namespace } from "socket.io";
export interface User {
  name: Username;
  color?: Color;
  position?: CanvasCoordinate;
}
export type CommandId = number;
export type ColorName = string;
export type HexColorString = string;
export type FillString = string;
export type StrokeWidth = number;
export type Threshold = number;
export type SvgString = string;
export type BoardId = string;
export type Username = string;
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

export interface HandleUndoInterface {
  username: string;
}
export interface HandleRedoInterface {
  username: string;
}

export interface CreateUserInterface {
  username: string;
}

export interface FindUserInterface {
  username: string;
}

export type Coordinate = {
  x: number;
  y: number;
};

export type CanvasCoordinate = Coordinate;

export interface Command {
  commandId: CommandId;
  owner: Username;
  display: Boolean;
  execute: (socket: Namespace) => void;
  undo: (socket: Namespace) => void;
  redo: (socket: Namespace) => void;
}

export interface PhysicalCommand extends Command {
  placement: CanvasCoordinate;
}
