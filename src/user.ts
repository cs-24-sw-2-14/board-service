class User {
    Username: string;
    PreferedColor?: UserColor;

    constructor(username: string, preferedColor?: UserColor) {
        this.Username = username;
        this.PreferedColor = preferedColor;
    }
}