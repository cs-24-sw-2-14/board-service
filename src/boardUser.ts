/**
 * Strictly contains all information about a user.
 */
class BoardUser {
    PreferedColor?: UserColor;
    Username: Username;

    constructor(username: Username, preferedColor?: UserColor) {
        this.Username = username;
        this.PreferedColor = preferedColor;
    }
}