class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Node {
    constructor(position) {
        this.position = position;
        this.distance = -1;
        this.parent = null;
    }
}
class Field {
    constructor(type) {
        this.type = type;
        this.rotationValue = 0;
        this.players = new Set();
        this.treasure = false;
        this.playerToCollectTreasure = null;
        this.highlight = false;
        this.accessibleDirections = {
            up : false,
            right : false,
            down : false,
            left : false,
        }
    }
    rotate(degree) {
        while (degree - 90 >= 0) {
            this.rotationValue += 90;
            let temp = this.accessibleDirections.down;
            this.accessibleDirections.down = this.accessibleDirections.right;
            this.accessibleDirections.right = this.accessibleDirections.up;
            this.accessibleDirections.up = this.accessibleDirections.left;
            this.accessibleDirections.left = temp;
            degree -= 90;
        }
    }
}
class Turn extends Field {
    constructor(rotationValue) {
        super("turn");
        this.accessibleDirections.right = true;
        this.accessibleDirections.down = true;
        this.rotate(rotationValue);
    }
}
class Junction extends Field {
    constructor(rotationValue) {
        super("junction");
        this.accessibleDirections.left = true;
        this.accessibleDirections.down = true;
        this.accessibleDirections.right = true;
        this.rotate(rotationValue);
    }
}
class Path extends Field {
    constructor(rotationValue) {
        super("path");
        this.accessibleDirections.up = true;
        this.accessibleDirections.down = true;
        this.rotate(rotationValue);
    }
}
