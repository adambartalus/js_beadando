class Player {
    constructor(id, startingPosition, color) {
        this.id = id;
        this.startingPosition = startingPosition;
        this.position = startingPosition;
        this.color = color;
        this.treasuresToCollect = [];
        this.accessibleNodes = [];
    }
}