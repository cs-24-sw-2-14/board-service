/**
 * Strictly contains all information about a user.
 */
class BoardUser {
    Username: string;
    PreferedColor?: UserColor;

    constructor(username: string, preferedColor?: UserColor) {
        this.Username = username;
        this.PreferedColor = preferedColor;
    }
}