const GameState = {
    PLAY: 1,
    END: 2,
};
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 4;
const MIN_TREASURES_PER_PLAYER = 1;
let max_treasures_per_player;
let fields;
// State
let gameState;
let fieldSize;

let table;
let players;
let activePlayer;
let activePlayerIndex;
let extraField;
//DOM references
let currArrow;
let arrowToDisable = null;
let currExtraField = null;

let animating = false;
let animatingRotation = false;
let toMove = false;

function init() {
    gameState = GameState.PLAY;
    initTable();
    initPlayers();
    initTreasures();
    activePlayerIndex = 0;
    activePlayer = players[0];

    updateContent();
    winnerDiv.style.display = 'none';
    fieldSize = parseInt(getComputedStyle(gameTable.firstElementChild.firstElementChild).width) + 2;
}
function initTable() {
    table = new Array(7).fill(0).map(r => new Array(7).fill(0));

    table[0][0] = new Turn(0);
    table[0][2] = new Junction(0);
    table[0][4] = new Junction(0);
    table[0][6] = new Turn(90);
    table[2][0] = new Junction(270);
    table[2][2] = new Junction(270);
    table[2][4] = new Junction(0);
    table[2][6] = new Junction(90);
    table[4][0] = new Junction(270);
    table[4][2] = new Junction(180);
    table[4][4] = new Junction(90);
    table[4][6] = new Junction(90);
    table[6][0] = new Turn(270);
    table[6][2] = new Junction(180);
    table[6][4] = new Junction(180);
    table[6][6] = new Turn(180);

    fields = [
        {
            name: "turn",
            pieces: 15,
        },
        {
            name: "junction",
            pieces: 6,
        },
        {
            name: "path",
            pieces: 13,
        }
    ]
    for (let i = 1; i < 7; i += 2) {
        table[i - 1][1] = getRandomField();
        table[i - 1][3] = getRandomField();
        table[i - 1][5] = getRandomField();
        for (let j = 0; j < 7; ++j) {
            table[i][j] = getRandomField();
        }
    }
    table[6][1] = getRandomField();
    table[6][3] = getRandomField();
    table[6][5] = getRandomField();

    extraField = getRandomField();
}
function initTreasures() {
    let treasureFields = []
    for (let i = 1; i < 6; i++) {
        treasureFields.push(new Position(0, i));
        for (let j = 0; j < 7; j++) {
            treasureFields.push(new Position(i, j));
        }
        treasureFields.push(new Position(6, i));
    }
    let ind, fieldPos, field;
    for (let i = 0; i < players.length; i++) {
        for (let j = 0; j < parseInt(treasuresInput.value); j++) {
            ind = Math.floor(Math.random() * treasureFields.length);
            fieldPos = treasureFields.splice(ind, 1)[0];
            field = table[fieldPos.x][fieldPos.y];
            players[i].treasuresToCollect.push(field);
            field.treasure = true;
            field.playerToCollectTreasure = players[i];
        }
    }
}
function initPlayers() {
    players = [];
    corners = [new Position(0, 0), new Position(0, 6), new Position(6, 0), new Position(6, 6)];
    colors = ["red", "green", "blue", "purple"];
    for (let i = 0; i < parseInt(playersInput.value); i++) {
        let cornerInd = Math.floor(Math.random() * (4 - i));
        let colorInd = Math.floor(Math.random() * (4 - i));
        let corner = corners.splice(cornerInd, 1)[0];
        let color = colors.splice(colorInd, 1)[0];

        players.push(new Player(i + 1, corner, color));
    }
    for (const p of players) {
        table[p.startingPosition.x][p.startingPosition.y].players.add(p);
    }
}
//Helper
function getPositionOfField(field) {
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (table[i][j] == field) {
                return new Position(i, j);
            }
        }
    }
    return null;
}
function getRandomField() {
    let randInt = Math.floor(Math.random() * 3);
    while (fields[randInt].pieces == 0) {
        randInt = (randInt + 1) % 3;
    }
    fields[randInt].pieces--;
    const randomRotationValue = 90 * Math.floor(Math.random() * 4);
    switch (fields[randInt].name) {
        case "turn":
            return new Turn(randomRotationValue);
        case "junction":
            return new Junction(randomRotationValue);
        case "path":
            return new Path(randomRotationValue);
        default:
            break;
    }
}
function getPathToField(field) {
    const endNode = getNodeOfField(field);
    let path = [endNode];
    let previous = endNode.parent;
    while (previous != null) {
        path.unshift(previous);
        previous = previous.parent;
    }
    return path;
}
function getNodeOfField(field) {
    let rowIndex = getIndexOfElement(field.parentElement);
    let colIndex = getIndexOfElement(field);
    for (const node of activePlayer.accessibleNodes) {
        if (node.position.x == rowIndex && node.position.y == colIndex) {
            return node;
        }
    }
    return null;
}
function isFieldAccessible(field, player) {
    let rowIndex = getIndexOfElement(field.parentElement);
    let colIndex = getIndexOfElement(field);
    for (const node of player.accessibleNodes) {
        if (node.position.x == rowIndex && node.position.y == colIndex) {
            return true;
        }
    }
    return false;
}
// Selected elements
const menu = document.querySelector('#menu');
const playersInput = document.querySelector('#players');
const decPlayersBtn = document.querySelector('#decPlayers');
const incPlayersBtn = document.querySelector('#incPlayers');
const treasuresInput = document.querySelector('#treasures');
const decTreasuresBtn = document.querySelector('#decTreasures');
const incTreasuresBtn = document.querySelector('#incTreasures');
const startButton = document.querySelector('#start');
const gameDescBtn = document.querySelector('#gameDescBtn');

const gameContent = document.querySelector('#gameContent');
const container = document.querySelector('#container');
const gameTable = document.querySelector("#gameTable");
const gameDatas = document.querySelector('#gameDatas');
const playerDatas = document.querySelector('#playerDatas');
const extraFieldDiv = document.querySelector('#extra');
const winnerDiv = document.querySelector('#winnerDiv');

const gameDescription = document.querySelector('#gameDescription');

const horizontalFrameUp = document.querySelectorAll('.hArrow')[0];
const horizontalFrameDown = document.querySelectorAll('.hArrow')[1];
const verticalFrameLeft = document.querySelectorAll('.vArrow')[0];
const verticalFrameRight = document.querySelectorAll('.vArrow')[1];

// Event listeners
window.addEventListener('resize', function (e) {
    if (gameContent.hidden) return;
    fieldSize = parseInt(getComputedStyle(gameTable.firstElementChild.firstElementChild).width) + 2;
    createFrame();
});
//menu
playersInput.addEventListener('input', function (e) {
    treasuresInput.value = 2;
    treasuresInput.max = 24 / this.value;
})
decPlayersBtn.addEventListener('click', function (e) {
    if (parseInt(playersInput.value) == 1) return;
    playersInput.value = parseInt(playersInput.value) - 1;
    max_treasures_per_player = 24 / parseInt(playersInput.value);
})
incPlayersBtn.addEventListener('click', function (e) {
    if (parseInt(playersInput.value) == 4) return;
    playersInput.value = parseInt(playersInput.value) + 1;
    max_treasures_per_player = 24 / parseInt(playersInput.value);
    if (parseInt(treasuresInput.value) > max_treasures_per_player) {
        treasuresInput.value = max_treasures_per_player;
    }
})
decTreasuresBtn.addEventListener('click', function (e) {
    if (parseInt(treasuresInput.value) === 1) return;
    treasuresInput.value = parseInt(treasuresInput.value) - 1;
})
incTreasuresBtn.addEventListener('click', function (e) {
    if (parseInt(treasuresInput.value) === max_treasures_per_player) return;
    treasuresInput.value = parseInt(treasuresInput.value) + 1;
})
startButton.addEventListener('click', function (e) {
    init();
    createFrame();
    menu.hidden = true;
    gameContent.hidden = false;
})
gameDescBtn.addEventListener('click', function (e) {
    menu.hidden = true;
    gameDescription.hidden = false;
})
document.addEventListener('click', function (e) {
    if (!e.target.matches('.mainScreenBtn')) {
        return;
    }
    gameContent.hidden = true;
    gameDescription.hidden = true;
    menu.hidden = false;
})
// game
const checkIfMouseIsOnArrow = function (event) {
    if (gameState == GameState.END) return;
    if (!event.target.matches('.upArrow') &&
        !event.target.matches('.downArrow') &&
        !event.target.matches('.leftArrow') &&
        !event.target.matches('.rightArrow')) {
        return;
    }
    if (animating) return;
    const newElement = document.createElement('div');
    newElement.classList.add("field", "extraField");
    newElement.innerHTML = `<div class="${extraField.type}"></div>`;
    newElement.firstElementChild.style.transform = `rotate(${extraField.rotationValue}deg)`;
    if (null != extraField.playerToCollectTreasure &&
        extraField.playerToCollectTreasure.treasuresToCollect[0] == extraField) {
        newElement.firstElementChild.innerHTML = `<div class="treasure_${extraField.playerToCollectTreasure.color}" style="z-index:1"></div>`;
    }

    const parentDiv = event.target.parentElement;
    const ind = getIndexOfElement(parentDiv)
    const row = gameTable.querySelector(`div.row:nth-child(${ind + 1})`);

    if (event.target.matches('.rightArrow')) {
        row.style.marginLeft = `-${fieldSize}px`;
        row.insertBefore(newElement, row.firstElementChild);
    }
    if (event.target.matches('.leftArrow')) {
        row.style.marginRight = `-${fieldSize}px`;
        row.appendChild(newElement);
    }
    if (event.target.matches('.downArrow')) {
        gameTable.style.marginTop = `-${fieldSize}px`;
        gameTable.insertBefore(genRowWithField(ind - 1, newElement), gameTable.firstElementChild);
    }
    if (event.target.matches('.upArrow')) {
        gameTable.appendChild(genRowWithField(ind - 1, newElement));
        gameTable.lastElementChild.style.position = 'absolute';
    }
    event.target.hidden = true;
    currArrow = event.target;
    currExtraField = newElement;
}
const checkIfMouseLeftExtraField = function (event) {
    if (gameState == GameState.END) return;
    const eField = event.target.closest('.extraField');
    if (null == currExtraField || (null != eField)) {
        return;
    }
    removeExtraField();
    animatingRotation = false;
}
document.addEventListener('mouseover', checkIfMouseLeftExtraField);
document.addEventListener('mouseover', checkIfMouseIsOnArrow);

gameTable.addEventListener('contextmenu', function (e) { // rotation of the extra field
    e.preventDefault();
    if (gameState == GameState.END) return;
    const eField = e.target.closest('.extraField');
    if (animatingRotation || null == eField) {
        return;
    }
    extraField.rotate(90);
    e.target.style.transform = `rotate(${extraField.rotationValue}deg)`;

    animatingRotation = true;
    setTimeout(function () {
        animatingRotation = false;
    }, 1500);
});
container.addEventListener('click', function (e) { // checking if player has to move
    if (gameState == GameState.END || animating || !toMove) {
        return;
    }
    const closest = e.target.closest('.field');
    if (null == closest || closest.matches('.extraField')) {
        return;
    }
    if (isFieldAccessible(closest, activePlayer)) {
        const path = getPathToField(closest);
        animating = true;
        moveAnim(false, path, 0);
    }
})
container.addEventListener('click', function (e) { // checking if player has to insert the extra field
    if (gameState == GameState.END || animating || animatingRotation || toMove) {
        return;
    }
    const closest = e.target.closest('.extraField');
    if (closest == null) {
        return;
    }
    closest.classList.remove('extraField');
    currExtraField = null;
    const row = closest.parentElement;

    if (arrowToDisable != null) {
        arrowToDisable.hidden = false;
    }
    if (row.matches('.extraRow')) {
        rowOrCol = "col";
        const colInd = parseInt(closest.style.marginLeft) / fieldSize;
        let mul = -1;
        let start = 0;
        let end = 6;
        if (row == gameTable.firstElementChild) {
            mul = 1;
            start = 1;
            end = 7;
        }
        closest.style.transform = `translate(0, ${mul * fieldSize}px)`;
        for (let i = start; i <= end; i++) {
            const r = gameTable.querySelector(`div.row:nth-child(${i + 1})`);
            const f = r.querySelector(`div.field:nth-child(${colInd + 1})`);
            f.style.transform = `translate(0, ${mul * fieldSize}px)`;
        }
        if (start == 0) {
            arrowToDisable = ((container.querySelectorAll(`.hArrow`)[0]).querySelector(`div:nth-child(${colInd + 2})`)).firstElementChild;
            insertIntoColEnd(colInd);
        }
        else {
            arrowToDisable = ((container.querySelectorAll(`.hArrow`)[1]).querySelector(`div:nth-child(${colInd + 2})`)).firstElementChild;
            insertIntoColBeggining(colInd);
        }
    } else {
        rowOrCol = "row";
        const rowInd = getIndexOfElement(closest.parentElement);
        if (closest == row.firstElementChild) {
            row.style.transform = `translate(${fieldSize}px, 0)`;
            insertIntoRowBeggining(rowInd);
            arrowToDisable = ((container.querySelectorAll('.vArrow')[1]).querySelector(`div:nth-child(${rowInd + 1})`)).firstElementChild;
        } else {
            row.style.transform = `translate(-${fieldSize}px, 0)`;
            insertIntoRowEnd(rowInd);
            arrowToDisable = ((container.querySelectorAll('.vArrow')[0]).querySelector(`div:nth-child(${rowInd + 1})`)).firstElementChild;
        }
    }
    animating = true;
    toMove = true;
    arrowToDisable.hidden = true;
    setTimeout(function () {
        currArrow.hidden = false;
        computePlayersPosition();
        setAccessibleFields(activePlayer);
        highlightAccessibleFields();
        updateContent();
        animating = false;
    }, 1500);
})
// updating

function removeExtraField() {
    const row = currExtraField.parentElement;
    if (row.matches('.extraRow')) {
        row.parentElement.removeChild(row);
    } else {
        row.removeChild(currExtraField);
        row.style.marginLeft = 0;
        row.style.marginRight = 0;
    }
    currArrow.hidden = false;
    currExtraField = null;
}
function updateTreasures() {
    let field, fieldPos, fieldDiv;
    for (const p of players) {
        if (p.treasuresToCollect.length > 0) {
            field = p.treasuresToCollect[0];
            fieldPos = getPositionOfField(field);
            if (null != fieldPos) {
                fieldDiv = gameTable.children[fieldPos.x].children[fieldPos.y];
                fieldDiv.innerHTML += `
                <div class="treasure_${p.color}"></div>
                `;
            }
        }
    }
}
function updatePlayerDatas() {
    playerDatas.innerHTML = `
    <tr>
        <th>Játékos<br>színe</th>
        <th>Játékos<br>neve</th>
        <th>Aktuális kincs<br>pozíciója</th>
        <th>Megszerzett<br>kincsek</th>
    </tr>
    ` + players.map(p => `
    <tr style="background-color:${p == activePlayer ? 'rgb(0, 200, 200)' : ''}">
        <td><div style="background-color:${p.color}"></div></td>
        <td>Játékos${p.id}</td>
        <td>
            ${p.treasuresToCollect.length == 0 || p.treasuresToCollect[0] == extraField ? '' :
            `(${getPositionOfField(p.treasuresToCollect[0]).x + 1}, ${getPositionOfField(p.treasuresToCollect[0]).y + 1})`}
        </td>
        <td>${parseInt(treasuresInput.value) - p.treasuresToCollect.length}/${parseInt(treasuresInput.value)}</td>
    </tr>
    `).join('');
}
function updateExtraField() {
    let treasure = false;
    for (const p of players) {
        if (p.treasuresToCollect[0] == extraField) {
            treasure = true;
            break;
        }
    }
    extraFieldDiv.innerHTML = `
    <div class="field">
        <div class="${extraField.type}">
            ${treasure ?
            `<div class="treasure_${extraField.playerToCollectTreasure.color}" style="z-index:1"></div>` :
            ''
        }
        </div>
    </div>
    `;
}
function updateContent() {
    gameTable.innerHTML = genGameTable();
    updateTreasures();
    updatePlayerDatas();
    updateExtraField();
}
// logic
function moveAnimation(path, i) {
    if (i + 1 >= path.length) {
        moveAnim(true, path, i);
        return;
    }
    let startNode = path[i];
    let endNode = path[i + 1];
    let vDiff = endNode.position.y - startNode.position.y;
    let hDiff = endNode.position.x - startNode.position.x;

    let s = 1;
    i++;
    // while(i < path.length - 1 &&
    //    path[i+1].position.y - path[i].position.y == vDiff &&
    //    path[i+1].position.x - path[i].position.x == hDiff) {
    //     s++;
    //     i++;
    // }
    const playerDiv = container.querySelector(`div.player[data-id="${activePlayer.id}"]`);
    playerDiv.style.transition = `transform ${1 * s}s`;
    playerDiv.style.transform += `translate(${s * vDiff * fieldSize}px, ${s * hDiff * fieldSize}px)`;
    setTimeout(function () {
        moveAnim(false, path, i);
    }, 1000 * s);
}
function moveAnim(end, path, i) {
    if (!end) {
        moveAnimation(path, i);
        return;
    }
    toMove = false;
    animating = false;
    const startingNodePos = path[0].position;
    const endingNodePos = path[path.length - 1].position;
    table[startingNodePos.x][startingNodePos.y].players.delete(activePlayer);
    table[endingNodePos.x][endingNodePos.y].players.add(activePlayer);
    activePlayer.position = endingNodePos;
    if (activePlayer.treasuresToCollect[0] == table[endingNodePos.x][endingNodePos.y]) {
        activePlayer.treasuresToCollect.shift();
    }
    clearHighlightedFields();
    if (checkWinner()) {
        return;
    }
    activePlayerIndex = (activePlayerIndex + 1) % players.length;
    activePlayer = players[activePlayerIndex];
    updateContent();
}
function checkWinner() {
    if (activePlayer.treasuresToCollect.length == 0 &&
        activePlayer.position.x == activePlayer.startingPosition.x &&
        activePlayer.position.y == activePlayer.startingPosition.y) {
        winner = activePlayer;
        gameState = GameState.END;

        winnerDiv.querySelector('p').innerHTML = `Játékos${winner.id} nyerte a játékot!`;
        winnerDiv.hidden = false;
        winnerDiv.style.display = 'inline-block';
        return true;
    }
    return false;
}
function computePlayersPosition() {
    for (const p of players) {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (table[i][j].players.has(p)) {
                    p.position = new Position(i, j);
                }
            }
        }
    }
}
function insertIntoRowBeggining(i) {
    table[i].unshift(extraField);
    extraField = table[i].pop();
    for (const p of extraField.players) {
        table[i][0].players.add(p);
        extraField.players.delete(p);
    }
}
function insertIntoRowEnd(i) {
    table[i].push(extraField);
    extraField = table[i].shift();
    for (const p of extraField.players) {
        table[i][6].players.add(p);
        extraField.players.delete(p);
    }
}
function insertIntoColBeggining(j) {
    const temp = extraField;
    extraField = table[6][j];
    for (let i = 6; i > 0; --i) {
        table[i][j] = table[i - 1][j];
    }
    table[0][j] = temp;

    for (const p of extraField.players) {
        table[0][j].players.add(p);
        extraField.players.delete(p);
    }
}
function insertIntoColEnd(j) {
    const temp = extraField;
    extraField = table[0][j];
    for (let i = 0; i < 6; ++i) {
        table[i][j] = table[i + 1][j];
    }
    table[6][j] = temp;

    for (const p of extraField.players) {
        table[6][j].players.add(p);
        extraField.players.delete(p);
    }
}
//Helper
function highlightAccessibleFields() {
    for (const node of activePlayer.accessibleNodes) {
        table[node.position.x][node.position.y].highlight = true;
    }
}
function clearHighlightedFields() {
    for (const node of activePlayer.accessibleNodes) {
        table[node.position.x][node.position.y].highlight = false;
    }
}
function setAccessibleFields(player) {
    player.accessibleNodes = [];
    const startingPos = player.position;
    const nodes = new Array(7).fill(0).map(r => new Array(7));
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            nodes[i][j] = new Node(new Position(i, j));
        }
    }
    const startingNode = nodes[startingPos.x][startingPos.y];
    startingNode.distance = 0;
    let q = [startingNode];
    let node;
    while (q.length > 0) {
        node = q.shift();
        q = q.concat(getAccessibleNeighbors(node, nodes));
        player.accessibleNodes.push(node);
    }
}
function getAccessibleNeighbors(node, nodes) {
    let result = [];
    const pos = node.position;
    const accessibleDirections = table[pos.x][pos.y].accessibleDirections;
    const up = accessibleDirections.up && pos.x > 0 && table[pos.x - 1][pos.y].accessibleDirections.down;
    const down = accessibleDirections.down && pos.x < 6 && table[pos.x + 1][pos.y].accessibleDirections.up;
    const left = accessibleDirections.left && pos.y > 0 && table[pos.x][pos.y - 1].accessibleDirections.right;
    const right = accessibleDirections.right && pos.y < 6 && table[pos.x][pos.y + 1].accessibleDirections.left;

    if (up && nodes[pos.x - 1][pos.y].distance == -1) {
        nodes[pos.x - 1][pos.y].distance = node.distance + 1;
        nodes[pos.x - 1][pos.y].parent = node;
        result.push(nodes[pos.x - 1][pos.y]);
    }
    if (right && nodes[pos.x][pos.y + 1].distance == -1) {
        nodes[pos.x][pos.y + 1].distance = node.distance + 1;
        nodes[pos.x][pos.y + 1].parent = node;
        result.push(nodes[pos.x][pos.y + 1]);
    }
    if (down && nodes[pos.x + 1][pos.y].distance == -1) {
        nodes[pos.x + 1][pos.y].distance = node.distance + 1;
        nodes[pos.x + 1][pos.y].parent = node;
        result.push(nodes[pos.x + 1][pos.y]);
    }
    if (left && nodes[pos.x][pos.y - 1].distance == -1) {
        nodes[pos.x][pos.y - 1].distance = node.distance + 1;
        nodes[pos.x][pos.y - 1].parent = node;
        result.push(nodes[pos.x][pos.y - 1]);
    }
    return result;
}
function getIndexOfElement(element) {
    const parent = element.parentElement;
    let i = 0;
    let e = parent.firstElementChild;
    while (e != element) {
        i++;
        e = e.nextElementSibling;
    }
    return i;
}
// HTML generator
function genRowWithField(j, fieldElement) {
    const row = document.createElement('div');
    row.classList.add('row', 'extraRow');
    row.appendChild(fieldElement);
    fieldElement.style.marginLeft = `${j * fieldSize}px`;
    return row;
}
function genGameTable() {
    return table.map(r => `
        <div class="row">${r.map(c => `
            <div class="field ${c.fixed ? 'fixed' : ''}" style="background-color: ${c.highlight ? 'rgb(100, 100, 100)' : ''}"}>
                <div class="${c.type}" style="transform:rotate(${c.rotationValue}deg)"></div>
                ${Array.from(c.players).map(p => `<div data-id="${p.id}" class="player" style="background-color: ${p.color};"></div>`).join('')}
            </div>
            `).join('')}
        </div>`)
        .join('');
}
function createFrame() {
    const horizontalFramUpDivs = Array.from(horizontalFrameUp.querySelectorAll('.hArrow > div'));
    const horizontalFrameDownDivs = Array.from(horizontalFrameDown.querySelectorAll('.hArrow > div'));
    const verticalFrameLeftDivs = Array.from(verticalFrameLeft.querySelectorAll('.vArrow > div'));
    const verticalFrameRightDivs = Array.from(verticalFrameRight.querySelectorAll('.vArrow > div'));

    horizontalFramUpDivs[0].style.width = '40px';
    horizontalFramUpDivs[8].style.width = '40px';
    horizontalFrameDownDivs[0].style.width = '40px';
    horizontalFrameDownDivs[8].style.width = '40px';

    for (let i = 1; i < 8; ++i) {
        horizontalFramUpDivs[i].style.width = `${fieldSize}px`;
        horizontalFrameDownDivs[i].style.width = `${fieldSize}px`;

        verticalFrameLeftDivs[i - 1].style.height = `${fieldSize}px`;
        verticalFrameRightDivs[i - 1].style.height = `${fieldSize}px`;
    }
}
