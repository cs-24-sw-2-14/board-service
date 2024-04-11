/**
 * The instance of a board.
 */
import { BoardUser } from "./boardUser";
import { BoardUID } from "./boardUID";

export class Board {
  UID: BoardUID;
  Users: BoardUser[] = [];

  constructor(UID: BoardUID) {
    this.UID = UID;
  }
}