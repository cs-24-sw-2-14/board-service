/**
 * The instance of a board.
 */
class Board {
  UID: BoardUID;
  Users: BoardUser[] = [];

  constructor(UID: BoardUID) {
    this.UID = UID;
  }
}