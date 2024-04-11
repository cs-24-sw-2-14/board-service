/**
 * Strictly contains all information about a user.
 */
import { NetworkedBoardUser } from "./networkedBoardUser";
import { Username } from "./username";
import { UserColor } from "./userColor";

export class BoardUser {
    Client: NetworkedBoardUser;
    Username: Username;
    Color: UserColor;

    constructor(client: NetworkedBoardUser, username: Username, color: UserColor) {
        this.Client = client;
        this.Username = username;
        this.Color = color;
    }
}