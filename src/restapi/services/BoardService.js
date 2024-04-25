/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Checks whether a board exists by UID
* Takes a board UID and checks whether the board exists.
*
* boardUnderscoreuid String UID of a board.
* returns Boolean
* */
const checkUID = ({ boardUnderscoreuid }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        boardUnderscoreuid,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Creates a new board
*
* returns board_create_result
* */
const createBoard = () => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Get invite to websocket server
*
* boardUnderscoreuid String UID of a board.
* returns board_join_result
* */
const joinBoard = ({ boardUnderscoreuid }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        boardUnderscoreuid,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Validates a board UID
* Takes a board UID and validates it.
*
* boardUnderscoreuid String UID of a board.
* returns Boolean
* */
const validateUID = ({ boardUnderscoreuid }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        boardUnderscoreuid,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  checkUID,
  createBoard,
  joinBoard,
  validateUID,
};
