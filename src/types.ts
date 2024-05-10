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

export type User = {
  username: string;
};

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
