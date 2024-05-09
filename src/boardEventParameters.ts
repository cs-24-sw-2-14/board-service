import { Coordinate } from "./types";

export interface StartDrawInterface {
  placement: Coordinate;
  path: Coordinate;
  stroke: string;
  fill: string;
  strokeWidth: number;
}

export interface HandleDoDrawInterface {
  commandId: string;
  x: number;
  y: number;
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
