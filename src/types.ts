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
export type ColorString = string;
export type StrokeWidth = number;
export type Threshold = number;
export type SvgString = string;
export type BoardId = string;
export type Username = string;
export type TextString = string; 

export type CoordinateSet = {
  x: number;
  y: number;
};

export type CanvasCoordinateSet = CoordinateSet;

export interface Command {
  // The interface Command consists of commandId, owner, done, execute, undo and redo.
  commandId: CommandId;
  // commandId is of the type CommandId (number). 
  owner: Username;
  // owner is of the type Username (string). 
  done: Boolean;
  // done is of the type Boolean (true or false). 
  execute: (socket: Namespace | Socket) => void;
  // Function execute takes in a socket of the type Namespace or Socket and returns void (noting). 
  undo: (socket: Namespace | Socket) => void;
  // Function undo takes in a socket of the type Namespace or Socket and returns void (noting).
  redo: (socket: Namespace | Socket) => void;
  // Function redo takes in a socket of the type Namespace or Socket and returns void (noting). 
}
