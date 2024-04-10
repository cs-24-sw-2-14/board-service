/**
 * Strictly contains all information about a user.
 */
class BoardUser {
    PreferedColor?: UserColor;
    Client: NetworkedBoardUser;
    Username: Username;

    constructor(client: NetworkedBoardUser, username: Username, preferedColor?: UserColor) {
        this.Client = client;
        this.Username = username;
        this.PreferedColor = preferedColor;
    }
}