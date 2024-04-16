import { BoardUser } from "./boardUser";
import { BoardUID } from "./boardUID";

/**
 * The instance of a board.
 */
export class Board {
  UID: BoardUID;
  Users: BoardUser[] = [];

  constructor(UID: BoardUID) {
    this.UID = UID;
  }
}