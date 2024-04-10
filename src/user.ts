enum UserColor {
    Red,
    Blue,
    Green,
    Pink,
    Orange,
    Yellow,
    Black,
    White,
    Purple,
    Brown,
    Cyan,
    Lime
}

class User {
    Username: string;
    PreferedColor?: UserColor;

    constructor(username: string, preferedColor?: UserColor) {
        this.Username = username;
        this.PreferedColor = preferedColor;
    }
}