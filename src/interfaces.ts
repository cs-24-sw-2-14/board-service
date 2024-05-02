export interface StartDrawInterface {
  placement: Coordinate;
  path: Coordinate;
  stroke: string;
  fill: string;
}

export interface HandleDoDrawInterface {
  commandId: string;
  x: number;
  y: number;
}
